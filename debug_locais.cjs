const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iubrpjatscyrerhzezxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugLocais() {
    const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'cf95.souza@gmail.com',
        password: '140415'
    });

    const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
    });

    // Tentar ler um local para ver as colunas
    const { data, error } = await authSupabase.from('locais').select('*').limit(1);
    
    if (error) {
        console.error('Erro ao buscar local:', error);
    } else {
        console.log('Estrutura do local:', Object.keys(data[0]));
        console.log('Dados do local:', data[0]);
    }

    // Tentar um update de teste em um local específico (corrigindo um dos locais se possível)
    if (data && data.length > 0) {
        const testId = data[0].id;
        console.log(`Tentando update de teste no ID: ${testId}`);
        const { error: updateError } = await authSupabase
            .from('locais')
            .update({ wifi_senha: 'teste-debug' })
            .eq('id', testId);
        
        if (updateError) {
            console.error('Erro no UPDATE:', updateError);
        } else {
            console.log('UPDATE realizado com sucesso via script!');
        }
    }
}

debugLocais();
