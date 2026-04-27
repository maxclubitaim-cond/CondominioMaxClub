import { supabase } from '../lib/supabase';

/**
 * Serviço para disparar notificações push para todos os usuários inscritos.
 * 
 * @param {Object} notification - Objeto da notificação
 * @param {string} notification.title - Título da notificação
 * @param {string} notification.body - Corpo da mensagem
 * @param {string} notification.url - URL para abrir ao clicar (opcional)
 */
export async function sendPushNotification(notification) {
    console.log('PushService: Iniciando processo de disparo global...', notification);

    try {
        // Buscar todas as assinaturas na tabela pwa_subscriptions
        const { data: subscriptions, error } = await supabase
            .from('pwa_subscriptions')
            .select('subscription');

        if (error) {
            console.error('PushService: Erro ao buscar assinaturas:', error);
            return { success: false, error };
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.warn('PushService: Nenhuma assinatura encontrada para disparo.');
            return { success: true, count: 0 };
        }

        console.log(`PushService: Disparando para ${subscriptions.length} dispositivos.`);

        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                notification,
                subscriptions: subscriptions.map(s => s.subscription)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Falha ao processar disparos no servidor');
        }

        return { success: true, count: result.count || subscriptions.length };
    } catch (err) {
        console.error('PushService: Erro inesperado:', err);
        return { success: false, error: err.message };
    }
}
