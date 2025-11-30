import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('🔐 Testando login com email .com...\n');

    const testEmail = 'adelar@master.com';
    const testPassword = '123456';

    console.log(`Email: ${testEmail}`);
    console.log(`Senha: ${testPassword}\n`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (error) {
        console.error('❌ FALHOU:', error.message);
    } else {
        console.log('✅ LOGIN FUNCIONOU!');
        console.log('User ID:', data.user?.id);
        console.log('Email:', data.user?.email);
        console.log('\n🎉 Autenticação está funcionando!');
        console.log('\nUsuários disponíveis:');
        console.log('  - adelar@master.com (admin)');
        console.log('  - junior@amx.com (admin)');
        console.log('  - marcia@master.com (user)');
        console.log('  Senha: 123456');
    }
}

testLogin();
