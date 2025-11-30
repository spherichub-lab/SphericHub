import React, { useState, useRef } from 'react';
import { DiopterInput } from './ui/DiopterInput';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import { addLensRecord } from '../services/lensService';
import { UserProfile } from '../types';

const INDICE_OPTIONS = [
  '1.49 - CR', 
  '1.53 - Trivex', 
  '1.56 - CR', 
  '1.59 - Poly', 
  '1.60 - Hi-index', 
  '1.61 - Hi-index', 
  '1.67 - Hi-index', 
  '1.74 - Hi-index'
];

// Opções padrão para a maioria dos índices
const STANDARD_TIPO_OPTIONS = ['Incolor', 'Photo'];
const STANDARD_TRATAMENTO_OPTIONS = ['AR', 'Filtro Azul (verde)', 'BlueCut (azul)'];

// Opções exclusivas para 1.49
const RESTRICTED_OPTIONS = ['Incolor'];

interface LensFormProps {
  onRecordAdded: () => void;
  currentUser: UserProfile;
}

export const LensForm: React.FC<LensFormProps> = ({ onRecordAdded, currentUser }) => {
  const [indice, setIndice] = useState('1.56 - CR');
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
  const is149 = indice === '1.49 - CR';
  const currentTipoOptions = is149 ? RESTRICTED_OPTIONS : STANDARD_TIPO_OPTIONS;
  const currentTratamentoOptions = is149 ? RESTRICTED_OPTIONS : STANDARD_TRATAMENTO_OPTIONS;

  const handleIndiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newIndice = e.target.value;
      setIndice(newIndice);

      if (newIndice === '1.49 - CR') {
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

    // Basic Validation
    if (!indice || !tipo || !tratamento) {
      setMessage({ type: 'error', text: 'Preencha Índice, Tipo e Tratamento.' });
      return;
    }
    if (esf === '' || cil === '') {
       setMessage({ type: 'error', text: 'Preencha ESF e CIL.' });
       return;
    }
    if (!quantidade || parseInt(quantidade) < 1) {
        setMessage({ type: 'error', text: 'Quantidade inválida.' });
        return;
    }

    setIsSubmitting(true);

    try {
      const record = {
        indice,
        tipo,
        tratamento,
        esf: parseFloat(esf),
        cil: parseFloat(cil),
        quantidade: parseInt(quantidade),
        company_id: currentUser.company_id 
      };

      await addLensRecord(record);
      
      setMessage({ type: 'success', text: 'Falta registrada com sucesso!' });
      
      // Behavior: Clear only Diopters, keep quantity 1
      setEsf('');
      setCil('');
      setQuantidade('1');
      
      // Notify parent to refresh list/dashboard
      onRecordAdded();

      // Return focus to ESF input for rapid entry
      setTimeout(() => {
        esfInputRef.current?.focus();
      }, 0);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao registrar. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAll = () => {
    setIndice('1.56 - CR'); // Reset default
    setTipo('Incolor');
    setTratamento(STANDARD_TRATAMENTO_OPTIONS[2]); // Reset to BlueCut
    setEsf('');
    setCil('');
    setQuantidade('1');
    setMessage(null);
    esfInputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Registrar Falta</h2>
        <button 
          type="button" 
          onClick={handleResetAll}
          className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={14} /> Limpar tudo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Lens Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Índice - Dropdown */}
          <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Índice</label>
            <select
                value={indice}
                onChange={handleIndiceChange}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow bg-white appearance-none cursor-pointer"
            >
                {INDICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Tipo - Dropdown */}
          <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow bg-white appearance-none cursor-pointer"
                disabled={is149} // Visual feedback that it's fixed
            >
                {currentTipoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
            {is149 && <p className="text-[10px] text-gray-400 mt-1">Fixo para 1.49</p>}
          </div>

          {/* Tratamento - Dropdown */}
          <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tratamento</label>
             <select
                value={tratamento}
                onChange={(e) => setTratamento(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow bg-white appearance-none cursor-pointer"
                disabled={is149} // Visual feedback that it's fixed
            >
                {currentTratamentoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
            {is149 && <p className="text-[10px] text-gray-400 mt-1">Fixo para 1.49</p>}
          </div>

        </div>

        {/* Row 2: Diopters */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Dioptria</h3>
          <div className="grid grid-cols-2 gap-6">
            <DiopterInput
              ref={esfInputRef}
              type="ESF"
              label="Esférico (ESF)"
              value={esf}
              onChange={setEsf}
              placeholder="+0.00"
              required
            />
            <DiopterInput
              type="CIL"
              label="Cilíndrico (CIL)"
              value={cil}
              onChange={setCil}
              placeholder="-0.00"
              required
            />
          </div>
          
          {/* New Quantity Field */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
            </label>
            <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
            />
             <p className="text-xs text-gray-500 mt-1">Quantidade de peças em falta</p>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center justify-center ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isSubmitting ? 'Salvando...' : 'Registrar Falta'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            ESF e CIL serão limpos automaticamente após salvar.
          </p>
        </div>
      </form>
    </div>
  );
};