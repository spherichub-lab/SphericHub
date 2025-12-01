import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Company } from '../types';

// --- MOCK DATA FOR DEMO ---

export let MOCK_COMPANIES: Company[] = [
  { id: '6cbdeca4-42ad-4412-ba1a-51a9bfd33ab4', name: 'Master', logo_url: 'https://ui-avatars.com/api/?name=Master&background=0D8ABC&color=fff', color_theme: 'blue', active: true },
  { id: 'c01ddcc2-7755-4d34-af0a-e0ab6e66c8dc', name: 'AMX', logo_url: 'https://ui-avatars.com/api/?name=AMX&background=D72638&color=fff', color_theme: 'red', active: true }
];

// Extending UserProfile internally for Mock Auth to handle passwords
interface MockUser extends UserProfile {
  password?: string;
}

export let MOCK_USERS: MockUser[] = [
  // Master Users
  { id: 'user_adelar', email: 'adelar@master.com', full_name: 'Adelar', role: 'admin', company_id: '6cbdeca4-42ad-4412-ba1a-51a9bfd33ab4', active: true, password: '123456' },
  { id: 'user_gustavo', email: 'gustavo@master.com', full_name: 'Gustavo', role: 'admin', company_id: '6cbdeca4-42ad-4412-ba1a-51a9bfd33ab4', active: true, password: '123456' },
  { id: 'user_marcia', email: 'marcia@master.com', full_name: 'Márcia', role: 'user', company_id: '6cbdeca4-42ad-4412-ba1a-51a9bfd33ab4', active: true, password: '123456' },

  // AMX Users
  { id: 'user_junior', email: 'junior@amx.com', full_name: 'Junior', role: 'admin', company_id: 'c01ddcc2-7755-4d34-af0a-e0ab6e66c8dc', active: true, password: '123456' },
  { id: 'user_kayllane', email: 'kayllane@amx.com', full_name: 'Kayllane', role: 'user', company_id: 'c01ddcc2-7755-4d34-af0a-e0ab6e66c8dc', active: true, password: '123456' },
  { id: 'user_miguel', email: 'miguel@amx.com', full_name: 'Miguel', role: 'user', company_id: 'c01ddcc2-7755-4d34-af0a-e0ab6e66c8dc', active: true, password: '123456' }
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
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_USERS];
  }
};

export const createUser = async (newUser: Omit<UserProfile, 'id' | 'active'>) => {
  if (isSupabaseConfigured && supabase) {
    // Create user in Supabase Auth with default password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: '123456', // Default password
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        company_id: newUser.company_id,
        active: true,
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Try to delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(profileError.message);
    }

    return profileData;
  } else {
    // Fallback to mock for local development
    await new Promise(resolve => setTimeout(resolve, 500));
    const created: MockUser = {
      ...newUser,
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      active: true,
      password: '123456'
    };
    MOCK_USERS.push(created);
    return created;
  }
};

export const updateUser = async (id: string, updates: Partial<UserProfile> & { password?: string }) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message);
    }

    // Update password if provided
    if (updates.password && updates.password.trim() !== '') {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
        password: updates.password
      });

      if (passwordError) {
        console.error('Error updating password:', passwordError);
      }
    }

    return data;
  } else {
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
  }
};

export const deleteUser = async (id: string) => {
  if (isSupabaseConfigured && supabase) {
    // Delete from profiles (auth user will be handled by cascade or manually)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error(profileError.message);
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Don't throw here as profile is already deleted
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index > -1) MOCK_USERS.splice(index, 1);
  }
};

// --- ADMIN COMPANIES FUNCTIONS ---

export const getCompanies = async (): Promise<Company[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      return [];
    }

    return data || [];
  } else {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...MOCK_COMPANIES];
  }
};

export const createCompany = async (newCompany: Omit<Company, 'id' | 'active'>) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...newCompany, active: true }])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw new Error(error.message);
    }

    return data;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const created: Company = {
      ...newCompany,
      id: `comp_${Math.random().toString(36).substr(2, 9)}`,
      active: true
    };
    MOCK_COMPANIES.push(created);
    return created;
  }
};

export const updateCompany = async (id: string, updates: Partial<Company>) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw new Error(error.message);
    }

    return data;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_COMPANIES.findIndex(c => c.id === id);
    if (index > -1) {
      MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], ...updates };
      return MOCK_COMPANIES[index];
    }
    throw new Error("Company not found");
  }
};

export const deleteCompany = async (id: string) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error(error.message);
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_COMPANIES.findIndex(c => c.id === id);
    if (index > -1) MOCK_COMPANIES.splice(index, 1);
  }
};