import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvamlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzAzNDYsImV4cCI6MjA0ODEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCustomEmailFormat() {
    console.log('Testing if Supabase accepts name@company email format...\n');

    const testEmail = 'testuser@testcompany';
    const testPassword = '123456';

    console.log(`Attempting signup with email: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (error) {
        console.error('❌ Signup failed:', error.message);
        console.error('Error details:', error);
    } else {
        console.log('✅ Signup successful!');
        console.log('User data:', data);
    }
}

testCustomEmailFormat();
