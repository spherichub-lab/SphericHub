import React, { useState, useRef } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { addLensRecord } from '../services/lensService';
import { UserProfile } from '../types';
import { DiopterInput } from './ui/DiopterInput';

const INDICE_OPTIONS = ['1.49', '1.53 - Trivex', '1.56', '1.59 - Poly', '1.60', '1.61', '1.67', '1.74'];
const STANDARD_TIPO_OPTIONS = ['Incolor', 'Photo'];
const STANDARD_TRATAMENTO_OPTIONS = ['Incolor', 'Anti-Reflexo', 'BlueCut (azul)'];

// Opções exclusivas para 1.49
const RESTRICTED_OPTIONS = ['Incolor'];

interface LensFormProps {
  onRecordAdded: () => void;
  currentUser: UserProfile;
}

export const LensForm: React.FC<LensFormProps> = ({ onRecordAdded, currentUser }) => {
  const [indice, setIndice] = useState('1.56');
  const [tipo, setTipo] = useState('Incolor');
  const [tratamento, setTratamento] = useState('BlueCut (azul)');
  const [esf, setEsf] = useState('');
  const [cil, setCil] = useState('');
  const [quantidade, setQuantidade] = useState('1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Ref for focus management
  const esfInputRef = useRef<HTMLInputElement>(null);

  // Derived state for available options
  const is149 = indice === '1.49';
  const currentTipoOptions = is149 ? RESTRICTED_OPTIONS : STANDARD_TIPO_OPTIONS;
  const currentTratamentoOptions = is149 ? RESTRICTED_OPTIONS : STANDARD_TRATAMENTO_OPTIONS;

  const handleIndiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndice = e.target.value;
    setIndice(newIndice);

    if (newIndice === '1.49') {
      // Force Incolor for both
      setTipo('Incolor');
      setTratamento('Incolor');
    } else {
      // If switching AWAY from 1.49, ensure Tratamento is valid (cannot be 'Incolor')
      // We check the current state 'tratamento' before the update takes effect
      if (tratamento === 'Incolor') {
        setTratamento(STANDARD_TRATAMENTO_OPTIONS[2]); // Default to BlueCut
      }
      // Tipo 'Incolor' is valid for others, so we don't strictly need to change it, 
      // but if the user was on 1.49, it was definitely Incolor.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!esf || !cil || !quantidade) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    setIsSubmitting(true);

    try {
      await addLensRecord({
        indice,
        tipo,
        tratamento,
        esf: parseFloat(esf),
        cil: parseFloat(cil),
        quantidade: parseInt(quantidade),
        company_id: currentUser.company_id,
        created_by: currentUser.id
      });

      setMessage({ type: 'success', text: 'Registro adicionado com sucesso!' });

      // Reset form
      setEsf('');
      setCil('');
      setQuantidade('1');

      // Keep current selections for speed, but reset focus
      if (esfInputRef.current) {
        esfInputRef.current.focus();
      }

      onRecordAdded();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao salvar registro. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIndice('1.56');
    setTipo('Incolor');
    setTratamento('BlueCut (azul)');
    setEsf('');
    setCil('');
    setQuantidade('1');
    setMessage(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1: Lens Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Indice */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Índice</label>
            <div className="relative">
              <select
                value={indice}
                onChange={handleIndiceChange}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block p-3 pr-8 outline-none transition-all hover:bg-slate-100 cursor-pointer"
              >
                {INDICE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <div className="relative">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={is149}
                className={`w-full appearance-none border text-sm rounded-lg block p-3 pr-8 outline-none transition-all ${is149
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-gray-900 focus:ring-slate-500 focus:border-slate-500 hover:bg-slate-100 cursor-pointer'
                  }`}
              >
                {currentTipoOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            {is149 && <p className="text-xs text-amber-600 mt-1">Fixo para índice 1.49</p>}
          </div>

          {/* Tratamento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tratamento</label>
            <div className="relative">
              <select
                value={tratamento}
                onChange={(e) => setTratamento(e.target.value)}
                disabled={is149}
                className={`w-full appearance-none border text-sm rounded-lg block p-3 pr-8 outline-none transition-all ${is149
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-gray-900 focus:ring-slate-500 focus:border-slate-500 hover:bg-slate-100 cursor-pointer'
                  }`}
              >
                {currentTratamentoOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            {is149 && <p className="text-xs text-amber-600 mt-1">Fixo para índice 1.49</p>}
          </div>

        </div>

        {/* Row 2: Diopters & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <DiopterInput
            label="Esférico (ESF)"
            value={esf}
            onChange={setEsf}
            placeholder="-0.00"
            ref={esfInputRef}
          />

          <DiopterInput
            label="Cilíndrico (CIL)"
            value={cil}
            onChange={setCil}
            placeholder="-0.00"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              min="1"
              className="w-full border border-slate-200 bg-slate-50 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block p-3 outline-none transition-all hover:bg-slate-100"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
            />
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            Limpar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-slate-900/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Registrar Saída
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};