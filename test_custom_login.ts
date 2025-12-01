import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('🔐 Testando login com email SEM .com (adelar@master)...\n');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'adelar@master',
        password: '123456',
    });

    if (error) {
        console.error('❌ FALHOU:', error.message);
    } else {
        console.log('✅ LOGIN FUNCIONOU!');
        console.log('User:', data.user?.email);
    }
}

testLogin();
