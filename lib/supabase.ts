import { createClient } from '@supabase/supabase-js';

// Access environment variables
// Note: In a real deployment, these would be in a .env file.
// For this demo, we check if they exist. If not, the app will use local mock mode.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = !!supabase;