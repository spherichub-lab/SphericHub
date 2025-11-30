import React, { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { signIn } from '../services/authService';
import { UserProfile } from '../types';
import { Logo } from './ui/Logo';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError);
      } else if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Updated Header Background to Slate 900 */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center bg-white/10 p-4 rounded-xl mb-4 backdrop-blur-sm shadow-inner ring-1 ring-white/10 text-white">
             <Logo className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">VisuLab</h1>
          <p className="text-slate-300 text-sm">Controle de Estoque Inteligente</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-colors bg-white text-gray-900"
                  placeholder="nome@empresa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-colors bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs text-center text-gray-400 mb-2">Contas Demo (Senha: 123456):</p>
             <div className="flex flex-wrap gap-2 justify-center text-xs">
                <button type="button" onClick={() => setEmail('adelar@master')} className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-700">Adelar (Master)</button>
                <button type="button" onClick={() => setEmail('junior@amx')} className="px-2 py-1 bg-red-50 rounded hover:bg-red-100 text-red-700">Junior (AMX)</button>
                <button type="button" onClick={() => setEmail('marcia@master')} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Márcia (User)</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};