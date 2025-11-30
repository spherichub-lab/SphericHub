import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfvxitfsqpcchdfdojyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdnhpdGZzcXBjY2hkZmRvanlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAzNDYsImV4cCI6MjA4MDEwNjM0Nn0.krXZY90obRDXreILihPnr8rqMmsjpF_Di8EIwBqQakY';

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'adelar@master.com', password: '123456', name: 'Adelar', role: 'admin', company: 'Master' },
    { email: 'gustavo@master.com', password: '123456', name: 'Gustavo', role: 'admin', company: 'Master' },
    { email: 'marcia@master.com', password: '123456', name: 'Márcia', role: 'user', company: 'Master' },
    { email: 'junior@amx.com', password: '123456', name: 'Junior', role: 'admin', company: 'AMX' },
    { email: 'kayllane@amx.com', password: '123456', name: 'Kayllane', role: 'user', company: 'AMX' },
    { email: 'miguel@amx.com', password: '123456', name: 'Miguel', role: 'user', company: 'AMX' }
];

async function createUsers() {
    console.log('🔧 Criando usuários via Supabase Auth API...\n');

    for (const user of users) {
        console.log(`Criando ${user.email}...`);
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    full_name: user.name,
                    role: user.role
                }
            }
        });

        if (error) {
            console.error(`  ❌ Erro: ${error.message}`);
        } else {
            console.log(`  ✅ Criado: ${data.user?.id}`);
        }
    }

    console.log('\n✅ Todos os usuários criados!');
    console.log('\nAgora teste o login com:');
    console.log('  Email: adelar@master.com');
    console.log('  Senha: 123456');
}

createUsers();
