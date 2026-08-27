import { createClient } from '@supabase/supabase-js';

// Cria uma instância secundária do Supabase sem persistência de sessão
// Isso permite criar novos usuários sem deslogar o GESTOR atual
export const supabaseAdminAuth = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            storageKey: 'supabase-admin-auth-token'
        }
    }
);
