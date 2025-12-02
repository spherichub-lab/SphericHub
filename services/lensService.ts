import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LensRecord, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'optitrack_local_data';

// Helper to get local data
const getLocalData = (): LensRecord[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save local data
const saveLocalData = (data: LensRecord[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const addLensRecord = async (record: Omit<LensRecord, 'id' | 'data_registro'>): Promise<LensRecord | null> => {
  if (isSupabaseConfigured && supabase) {
    // Remove created_by if it exists, as it's not in the database schema
    const { created_by, ...dbRecord } = record;

    const { data, error } = await supabase
      .from('lentes_saida')
      .insert([dbRecord])
      .select()
      .single();

    if (error) {
      console.error('Error adding record to Supabase:', error);
      throw error;
    }
    return data;
  } else {
    // Fallback to local storage for demo
    const newRecord: LensRecord = {
      ...record,
      id: uuidv4(),
      data_registro: new Date().toISOString(),
    };
    const currentData = getLocalData();
    saveLocalData([newRecord, ...currentData]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return newRecord;
  }
};

export const getLensRecords = async (user: UserProfile): Promise<LensRecord[]> => {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('lentes_saida')
      .select('*')
      .order('data_registro', { ascending: false });

    // Multi-tenancy logic: 
    // If admin, see all (or filter by selected company in UI - future feature)
    // If user, MUST only see their company_id
    if (user.role !== 'admin') {
      query = query.eq('company_id', user.company_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching records from Supabase:', error);
      throw error;
    }
    return data || [];
  } else {
    // Fallback Mock Logic
    await new Promise(resolve => setTimeout(resolve, 300));
    let records = getLocalData();

    // Filter Mock Data
    if (user.role !== 'admin') {
      records = records.filter(r => r.company_id === user.company_id);
    }

    return records.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());
  }
};

// Simulated Endpoint for n8n integration logic
// Note: In a real API, this would take an auth token and filter by company
export const getRankingLentesAPI = async () => {
  // This is a simulated backend function, so we fetch generic "all" or specific mock
  // For safety in this demo, let's just return null or generic data
  // In production, this would be an Edge Function.
  return null;
};