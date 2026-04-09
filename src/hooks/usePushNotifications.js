import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BAU5mek47xtesYPESKQefbCsRrVfvjYbj2fgvFziMXZD3BQyY7NAU-N0wipMXw3YIW0RDPGCZftCh-xIPiZYdxI';

export function usePushNotifications() {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [subscribing, setSubscribing] = useState(false);

    /**
     * Converte a chave VAPID para Uint8Array para o pushManager
     */
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Solicita permissão e registra o dispositivo
     */
    async function subscribeUser() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push não suportado neste navegador.');
            return;
        }

        setSubscribing(true);
        try {
            if (typeof Notification === 'undefined') {
                throw new Error('API de Notificações não suportada neste dispositivo/navegador.');
            }
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                
                // Pegar ou criar a subscrição
                let subscription = await registration.pushManager.getSubscription();
                
                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    });
                }

                // Salvar no Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase
                        .from('push_subscriptions')
                        .upsert({
                            user_id: user.id,
                            subscription: subscription.toJSON(),
                            user_agent: navigator.userAgent
                        }, { onConflict: 'user_id, subscription' });

                    if (error) throw error;
                    console.log('Subscrição WebPush registrada com sucesso.');
                }
            }
        } catch (error) {
            console.error('Erro ao subscrever WebPush:', error);
        } finally {
            setSubscribing(false);
        }
    }

    return { permission, subscribeUser, subscribing };
}
