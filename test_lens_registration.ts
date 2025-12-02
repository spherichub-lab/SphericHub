import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLensRegistration() {
    console.log('Testing lens registration...\n');

    const testEmail = 'adelar@master.com';
    const testPassword = '123456';

    // 1. Login
    console.log(`Attempting login with: ${testEmail}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (authError) {
        console.error('❌ Login failed:', authError.message);
        return;
    }
    console.log('✅ Login successful!');
    const userId = authData.user?.id;

    // 2. Get Profile for Company ID
    console.log('Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('❌ Failed to fetch profile:', profileError.message);
        return;
    }
    console.log('✅ Profile fetched:', profile);
    const companyId = profile.company_id;

    // 3. Try to insert lens record
    console.log('Attempting to insert lens record...');
    const newRecord = {
        indice: '1.56',
        tipo: 'Incolor',
        tratamento: 'BlueCut (azul)',
        esf: -2.00,
        cil: -1.00,
        quantidade: 1,
        company_id: companyId
        // created_by removed as it doesn't exist in DB
    };

    const { data: insertData, error: insertError } = await supabase
        .from('lentes_saida')
        .insert([newRecord])
        .select()
        .single();

    if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        console.error('Error details:', insertError);
        console.error('Hint:', insertError.hint);
        console.error('Code:', insertError.code);
    } else {
        console.log('✅ Insert successful!');
        console.log('Inserted record:', insertData);
    }
}

testLensRegistration();
