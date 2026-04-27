import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BJTvnnJigZoR42RhR5hCibuDjLmKDQ18WMYXVnO2en_MF_bXGRUrXgQ-fMGuVXE8l6RAsm41EuUKa470g3hinp0';

export function usePushNotifications() {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSubscription();
    }, []);

    async function checkSubscription() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setLoading(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Erro ao verificar inscrição push:', error);
        } finally {
            setLoading(false);
        }
    }

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

        setLoading(true);
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
                
                // Upsert na tabela pwa_subscriptions
                // Se for visitante, user_id fica null
                const { error } = await supabase
                    .from('pwa_subscriptions')
                    .upsert({
                        user_id: user?.id || null,
                        subscription: subscription.toJSON(),
                        user_agent: navigator.userAgent
                    }, { onConflict: 'subscription' });

                if (error) throw error;
                setIsSubscribed(true);
                console.log('Subscrição WebPush registrada com sucesso.');
            }
        } catch (error) {
            console.error('Erro ao subscrever WebPush:', error);
        } finally {
            setLoading(false);
        }
    }

    return { permission, subscribeUser, loading, isSubscribed };
}
