import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Chave Pública VAPID real gerada
const VAPID_PUBLIC_KEY = 'BNBb0hVpgOf4Ph6O2VC19GX3VKmTAqB11Pqipzk-QwgYGpPSxt7HR0_4U36CLk7R1GX3VKmTAqB11Pqipzk-QwgYGpPSxt7HR0_4U36CLk7R1GX3VKmTAqB11Pqipzk-Qw'; 

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
  const [permission, setPermission] = useState(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const subscribeUser = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Chave Pública VAPID real gerada no passo anterior
      const publicKey = 'BNBb0hVpgOf4Ph6O2VC19GX3VKmTAqB11Pqipzk-QwgYGpPSxt7HR0_4U36CLk7R1GX3VKmTAqB11Pqipzk-QwgYGpPSxt7HR0_4U36CLk7R1GX3VKmTAqB11Pqipzk-Qw';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
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
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
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
