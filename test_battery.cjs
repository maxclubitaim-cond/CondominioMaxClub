const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iubrpjatscyrerhzezxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('--- INICIANDO BATERIA DE TESTES ---');

  // 1. Autenticar
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'cf95.souza@gmail.com',
    password: '140415'
  });

  const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
  });

  // 2. Testar Avisos
  console.log('\n[1/2] Verificando Avisos no Banco:');
  const { data: avisos } = await authSupabase.from('avisos').select('*').order('created_at', { ascending: false }).limit(3);
  
  const today = new Date().toLocaleDateString('en-CA');
  console.log('Data hoje (local):', today);
  
  avisos.forEach(a => {
    const expired = a.data_fim && a.data_fim < today;
    console.log(`- ID: ${a.id} | Titulo: ${a.titulo} | Expira: ${a.data_fim} | Status: ${expired ? 'EXPIRADO' : 'ATIVO'}`);
  });

  // 3. Testar Assinaturas
  console.log('\n[2/2] Verificando Inscrições Push:');
  const { data: subs } = await authSupabase.from('pwa_subscriptions').select('created_at, user_agent');
  console.log(`Total de dispositivos encontrados: ${subs.length}`);
  
  // Ver se tem algum de "agora"
  const recentSubs = subs.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 60000));
  console.log(`Inscrições feitas nos últimos 30 minutos: ${recentSubs.length}`);
  
  console.log('\n--- FIM DOS TESTES ---');
}

runTests();
