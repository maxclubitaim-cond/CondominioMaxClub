const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

// Configurações (Preencha com o que pegamos do .env)
const SUPABASE_URL = 'https://iubrpjatscyrerhzezxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA';

// Chaves VAPID (Geradas anteriormente)
const VAPID_PUBLIC_KEY = 'BAA1cYTGg1u0VJmVEK4YQ_WExYlH6P__CaD8bvTzkXLeU34q1XNQBRqYW627FdaLgVNKEhSs92tEjUHW6WJuuM8';
const VAPID_PRIVATE_KEY = 'mJ5fzEm5xhPOPESIh9JcJifypw0BRUWhdrVQXEXF0qU';

webpush.setVapidDetails(
  'mailto:maxclubitaim@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendNotifications() {
  console.log('--- Iniciando Disparo de Teste ---');

  // 1. Autenticar como Admin (usando as credenciais fornecidas pelo usuário)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'cf95.souza@gmail.com',
    password: '140415'
  });

  if (authError) {
    console.error('Erro ao autenticar:', authError.message);
    return;
  }

  console.log('Autenticado como administrador!');

  // Criar cliente autenticado para ler a tabela
  const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  });

  // 2. Buscar assinaturas
  const { data: subscriptions, error: subError } = await authSupabase
    .from('pwa_subscriptions')
    .select('*');

  if (subError) {
    console.error('Erro ao buscar assinaturas:', subError.message);
    return;
  }

  console.log(`Encontradas ${subscriptions.length} assinaturas.`);

  // 3. Disparar notificações
  const payload = JSON.stringify({
    title: 'Teste de Notificação MaxClub 🚀',
    body: 'Parabéns! Suas notificações PWA estão funcionando corretamente.',
    url: '/'
  });

  for (const sub of subscriptions) {
    try {
      console.log(`Enviando para dispositivo: ${sub.device_info?.platform || 'Desconhecido'}`);
      await webpush.sendNotification(sub.subscription, payload);
      console.log('Sucesso!');
    } catch (err) {
      console.error('Erro ao enviar para sub:', err.endpoint, err.message);
    }
  }

  console.log('--- Disparo Concluído ---');
}

sendNotifications();
