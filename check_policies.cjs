const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iubrpjatscyrerhzezxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPolicies() {
    // Listar políticas (requer permissões de admin ou querying pg_policies se permitido)
    // Como não sou superuser, vou tentar inferir via comportamento ou tentando updates com diferentes perfis.
    
    const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'cf95.souza@gmail.com',
        password: '140415'
    });

    const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
    });

    // Verificar perfil do usuário
    const { data: profile } = await authSupabase.from('perfis').select('*').eq('id', authData.user.id).single();
    console.log('Perfil do usuário:', profile);

    // Tentar ler políticas via RPC se disponível ou via consulta direta
    const { data: policies, error: polError } = await authSupabase.rpc('get_policies', { table_name: 'locais' });
    if (polError) {
        console.log('Não foi possível ler políticas via RPC. Tentando via information_schema...');
        const { data: pol2 } = await authSupabase.from('pg_policies').select('*').eq('tablename', 'locais');
        console.log('Políticas (se visível):', pol2);
    } else {
        console.log('Políticas:', policies);
    }
}

checkPolicies();
