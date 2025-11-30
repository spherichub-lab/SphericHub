import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Testing login with existing user...\n');

    const testEmail = 'adelar@master';
    const testPassword = '123456';

    console.log(`Attempting login with:`);
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}\n`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (error) {
        console.error('❌ Login failed:', error.message);
        console.error('Error code:', error.status);
        console.error('Full error:', error);
    } else {
        console.log('✅ Login successful!');
        console.log('User ID:', data.user?.id);
        console.log('User email:', data.user?.email);
    }
}

testLogin();
