
import { createClient } from '@supabase/supabase-js';


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const email = `test_${Date.now()}@example.com`;
    const password = '123456';

    console.log(`Attempting signup for ${email}...`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        console.error('SignUp Error:', signUpError.message);
        // If signup fails, try login (maybe user exists)
    } else {
        console.log('SignUp Success! User ID:', signUpData.user?.id);
    }

    console.log(`Attempting login for ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Auth Error:', authError.message);
        return;
    }

    console.log('Auth Success! User ID:', authData.user.id);
}

testLogin();
