import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Chave Pública VAPID real e limpa
const VAPID_PUBLIC_KEY = 'BHAWwcf9lHdKAxyzS2JMk7K-xBSdMxW4MkzYvHIGStrio0xj9qmVpd43lw_Gw__DrMAjknawnp39ovLriJ4mdII'; 

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

export function usePushNotifications() {
  const [permission, setPermission] = useState(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && typeof Notification !== 'undefined') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (e) {
        console.error('Error checking subscription:', e);
      }
    }
  };

  const subscribeUser = async () => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      alert('As notificações não são suportadas neste navegador/dispositivo.');
      return false;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Salvar no Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('pwa_subscriptions')
        .insert({
          user_id: user?.id || null,
          subscription: subscription.toJSON(),
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        });

      if (error) throw error;

      setIsSubscribed(true);
      setPermission('granted');
      alert('Notificações ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Erro ao ativar notificações: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    loading,
    subscribeUser
  };
}
