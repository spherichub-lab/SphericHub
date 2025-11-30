import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Company } from '../types';

// --- MOCK DATA FOR DEMO ---

export let MOCK_COMPANIES: Company[] = [
  { id: 'comp_master', name: 'Master', logo_url: 'https://ui-avatars.com/api/?name=Master&background=0D8ABC&color=fff', color_theme: 'blue', active: true },
  { id: 'comp_amx', name: 'AMX', logo_url: 'https://ui-avatars.com/api/?name=AMX&background=D72638&color=fff', color_theme: 'red', active: true }
];

// Extending UserProfile internally for Mock Auth to handle passwords
interface MockUser extends UserProfile {
  password?: string;
}

export let MOCK_USERS: MockUser[] = [
  // Master Users
  { id: 'user_adelar', email: 'adelar@master.com', full_name: 'Adelar', role: 'admin', company_id: 'comp_master', active: true, password: '123456' },
  { id: 'user_gustavo', email: 'gustavo@master.com', full_name: 'Gustavo', role: 'admin', company_id: 'comp_master', active: true, password: '123456' },
  { id: 'user_marcia', email: 'marcia@master.com', full_name: 'Márcia', role: 'user', company_id: 'comp_master', active: true, password: '123456' },

  // AMX Users
  { id: 'user_junior', email: 'junior@amx.com', full_name: 'Junior', role: 'admin', company_id: 'comp_amx', active: true, password: '123456' },
  { id: 'user_kayllane', email: 'kayllane@amx.com', full_name: 'Kayllane', role: 'user', company_id: 'comp_amx', active: true, password: '123456' },
  { id: 'user_miguel', email: 'miguel@amx.com', full_name: 'Miguel', role: 'user', company_id: 'comp_amx', active: true, password: '123456' }
];

// --- SERVICE ---

export const getCompanyById = (id: string): Company | undefined => {
  return MOCK_COMPANIES.find(c => c.id === id);
};

export const signIn = async (email: string, password: string): Promise<{ user: UserProfile | null, error: string | null }> => {
  if (isSupabaseConfigured && supabase) {
    // Real Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return { user: null, error: authError.message };
    if (!authData.user) return { user: null, error: 'Usuário não encontrado' };

    // Fetch Profile linked to Auth User
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { user: null, error: 'Perfil de usuário não configurado.' };
    }

    // Check if active
    if (profileData.active === false) {
      return { user: null, error: 'Usuário desativado.' };
    }

    return { user: profileData as UserProfile, error: null };

  } else {
    // Mock Auth
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    const user = MOCK_USERS.find(u => u.email === email);

    if (user) {
      if (!user.active) return { user: null, error: 'Usuário desativado pelo administrador.' };

      // Check password (default 123456 or custom if changed)
      const currentPassword = user.password || '123456';

      if (password === currentPassword) return { user, error: null };
      return { user: null, error: 'Senha incorreta (Padrão: 123456)' };
    }
    return { user: null, error: 'Usuário não encontrado' };
  }
};

export const signOut = async () => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
};

// --- ADMIN USERS FUNCTIONS ---

export const getUsers = async (): Promise<UserProfile[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_USERS];
};

export const createUser = async (newUser: Omit<UserProfile, 'id' | 'active'>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const created: MockUser = {
    ...newUser,
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    active: true,
    password: '123456' // Default password for new users
  };
  MOCK_USERS.push(created);
  return created;
};

export const updateUser = async (id: string, updates: Partial<UserProfile> & { password?: string }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = MOCK_USERS.findIndex(u => u.id === id);
  if (index > -1) {
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };

    // Handle password update explicitly for mock
    if (updates.password && updates.password.trim() !== '') {
      MOCK_USERS[index].password = updates.password;
    }

    return MOCK_USERS[index];
  }
  throw new Error("User not found");
};

export const deleteUser = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = MOCK_USERS.findIndex(u => u.id === id);
  if (index > -1) MOCK_USERS.splice(index, 1);
};

// --- ADMIN COMPANIES FUNCTIONS ---

export const getCompanies = async (): Promise<Company[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...MOCK_COMPANIES];
};

export const createCompany = async (newCompany: Omit<Company, 'id' | 'active'>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const created: Company = {
    ...newCompany,
    id: `comp_${Math.random().toString(36).substr(2, 9)}`,
    active: true
  };
  MOCK_COMPANIES.push(created);
  return created;
};

export const updateCompany = async (id: string, updates: Partial<Company>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = MOCK_COMPANIES.findIndex(c => c.id === id);
  if (index > -1) {
    MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], ...updates };
    return MOCK_COMPANIES[index];
  }
  throw new Error("Company not found");
};

export const deleteCompany = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = MOCK_COMPANIES.findIndex(c => c.id === id);
  if (index > -1) MOCK_COMPANIES.splice(index, 1);
};