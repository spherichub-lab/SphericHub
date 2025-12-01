import { supabase } from '../lib/supabase';

export interface Purchase {
    id: string;
    company_id: string;
    supplier: string;
    purchase_date: string;
    created_by: string;
    created_at: string;
}

export const getPurchases = async (companyId?: string, startDate?: string, endDate?: string) => {
    let query = supabase
        .from('purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    if (startDate) {
        query = query.gte('purchase_date', startDate);
    }

    if (endDate) {
        // Add one day to include the end date fully if it's just a date string
        // Assuming endDate is YYYY-MM-DD, we want everything up to end of that day
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('purchase_date', nextDay.toISOString());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching purchases:', error);
        return [];
    }

    return data as Purchase[];
};

export const createPurchase = async (purchase: Omit<Purchase, 'id' | 'created_at' | 'created_by'>) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Get profile to check role/company if needed, but for now just insert
    // We need the profile ID for created_by
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
        .from('purchases')
        .insert([{
            ...purchase,
            created_by: profile.id
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating purchase:', error);
        throw error;
    }

    return data as Purchase;
};

export const deletePurchase = async (id: string) => {
    const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting purchase:', error);
        throw error;
    }
};
