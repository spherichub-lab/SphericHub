import { createClient } from '@supabase/supabase-js';

// Access environment variables
// Note: In a real deployment, these would be in a .env file.
// For this demo, we check if they exist. If not, the app will use local mock mode.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = !!supabase;