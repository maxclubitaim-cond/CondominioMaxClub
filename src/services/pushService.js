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
    console.log('PushService: Iniciando processo de disparo...', notification);

    try {
        // 1. Buscar todas as assinaturas válidas do banco
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

        // 2. Chamar a Vercel Function (ou Edge Function)
        const response = await fetch('/api/send-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notification,
                subscriptions
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Falha ao processar disparos no servidor');
        }

        console.log('PushService: Disparo real concluído:', result);
        
        return { success: true, count: result.count };
    } catch (err) {
        console.error('PushService: Erro inesperado:', err);
        return { success: false, error: err };
    }
}
