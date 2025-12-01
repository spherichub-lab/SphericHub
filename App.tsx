import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, LogOut, Settings, Building, Users, RefreshCcw, X, ShoppingCart } from 'lucide-react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { LensForm } from './components/LensForm';
import { AdminUsers } from './components/AdminUsers';
import { AdminCompanies } from './components/AdminCompanies';
import { AdminPurchases } from './components/AdminPurchases';
import { signOut, getLensRecords, updateUser, getCompanyById } from './services/authService';
import { UserProfile, LensRecord } from './services/authService';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [data, setData] = useState<LensRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('register');

  // Profile Settings State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', password: '' });

  // Load user from local storage persistence mock on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('visulab_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('visulab_user', JSON.stringify(user));
    // Default tab logic based on role
    setActiveTab(user.role === 'admin' ? 'dashboard' : 'register');
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    localStorage.removeItem('visulab_user');
    setData([]);
  };

  const loadData = async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const records = await getLensRecords(currentUser);
      setData(records);
    } catch (error) {
      console.error("Failed to load records", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser && activeTab === 'dashboard') {
      loadData();
    }
  }, [currentUser, activeTab]);

  const handleRecordAdded = () => {
    if (activeTab === 'dashboard') loadData();
  };

  const openProfileModal = () => {
    if (currentUser) {
      setProfileForm({ full_name: currentUser.full_name, password: '' });
      setShowProfileModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const updated = await updateUser(currentUser.id, {
        full_name: profileForm.full_name,
        // In a real app we would handle password change securely here
      });

      setCurrentUser(updated);
      localStorage.setItem('visulab_user', JSON.stringify(updated));
      setShowProfileModal(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // --- RENDER LOGIN IF NO USER ---
  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const currentCompany = getCompanyById(currentUser.company_id);
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Navbar - Updated to Dark Theme (Slate 900) */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg text-white">
                <Logo className="h-9 w-9" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">VisuLab</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {isAdmin ? 'Painel Administrativo' : 'Controle de Estoque'}
                </p>
              </div>
            </div>

            {/* User Profile Area */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-white">{currentUser.full_name}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  {currentCompany?.name}
                  {isAdmin && <span className="bg-purple-900 text-purple-200 px-1.5 rounded text-[10px] font-bold">ADMIN</span>}
                </div>
              </div>

              {/* Settings Gear */}
              <button
                onClick={openProfileModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                title="Configurações de Perfil"
              >
                <Settings size={20} />
              </button>

              {/* Company Logo Avatar */}
              <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 shadow-sm overflow-hidden flex items-center justify-center relative group">
                {currentCompany?.logo_url ? (
                  <img src={currentCompany.logo_url} alt={currentCompany.name} className="h-full w-full object-cover" />
                ) : (
                  <Building className="text-slate-500" size={20} />
                )}
              </div>

              <div className="h-8 w-px bg-slate-800 mx-1"></div>

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-2 cursor-pointer"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation - Updated Colors */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">

          {/* Admin Priority: Dashboard first */}
          <button
            onClick={() => { setActiveTab('dashboard'); loadData(); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all border cursor-pointer ${activeTab === 'dashboard'
              ? 'bg-white border-slate-300 text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
              }`}
          >
            <LayoutDashboard size={18} />
            {isAdmin ? 'Dashboard Global' : 'Meu Histórico'}
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all border cursor-pointer ${activeTab === 'register'
              ? 'bg-white border-slate-300 text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
              }`}
          >
            <PlusCircle size={18} />
            Registrar Falta
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('admin_users')}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all border cursor-pointer ${activeTab === 'admin_users'
                  ? 'bg-white border-purple-200 text-purple-700 shadow-sm ring-1 ring-purple-100'
                  : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Users size={18} />
                Gerenciar Usuários
              </button>

              <button
                onClick={() => setActiveTab('admin_companies')}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all border cursor-pointer ${activeTab === 'admin_companies'
                  ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                  : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Building size={18} />
                Gerenciar Empresas
              </button>

              <button
                onClick={() => setActiveTab('admin_purchases')}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all border cursor-pointer ${activeTab === 'admin_purchases'
                  ? 'bg-white border-emerald-200 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                  : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <ShoppingCart size={18} />
                Compras
              </button>
            </>
          )}
        </div>

        {/* Views */}
        <div className="animate-in fade-in zoom-in duration-300">

          {activeTab === 'register' && (
            <div className="flex flex-col gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">Novo Registro</h2>
                <p className="text-gray-500 mt-1">Registrando saída para: <span className="font-semibold text-slate-700">{currentCompany?.name}</span></p>
              </div>
              <LensForm onRecordAdded={handleRecordAdded} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isAdmin ? 'Visão Geral (Todas Empresas)' : `Histórico - ${currentCompany?.name}`}
                  </h2>
                  <p className="text-gray-500 mt-1">Análise de dados e relatórios.</p>
                </div>
                <button
                  onClick={loadData}
                  disabled={loadingData}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  title="Atualizar dados"
                >
                  <RefreshCcw size={20} className={loadingData ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingData ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
                </div>
              ) : (
                <Dashboard data={data} currentUser={currentUser} />
              )}
            </div>
          )}

          {activeTab === 'admin_users' && isAdmin && (
            <AdminUsers currentUser={currentUser} />
          )}

          {activeTab === 'admin_companies' && isAdmin && (
            <AdminCompanies />
          )}

          {activeTab === 'admin_purchases' && isAdmin && (
            <AdminPurchases />
          )}

          {showProfileModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Configurações de Perfil</h3>
                  <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Nome Completo</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                      required
                      value={profileForm.full_name}
                      onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Senha (Novo valor)</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                      value={profileForm.password}
                      onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                      placeholder="Deixe em branco para manter"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Informações da Conta</p>
                    <div>
                      <label className="block text-xs text-gray-500">E-mail</label>
                      <div className="text-sm font-medium text-gray-700">{currentUser.email}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Empresa</label>
                      <div className="text-sm font-medium text-gray-700">{currentCompany?.name}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Função</label>
                      <div className="text-sm font-medium text-gray-700 capitalize">{currentUser.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}</div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer">Cancelar</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer">Salvar Alterações</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;