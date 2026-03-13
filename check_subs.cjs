const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iubrpjatscyrerhzezxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSubs() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'cf95.souza@gmail.com',
    password: '140415'
  });

  const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
  });

  const { data } = await authSupabase.from('pwa_subscriptions').select('device_info');
  console.log(JSON.stringify(data, null, 2));
}

checkSubs();
