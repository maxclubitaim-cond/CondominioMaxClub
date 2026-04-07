import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push'

const _VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const _VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')

webpush.setVapidDetails(
  'mailto:contato@maxclubitaim.com.br',
  _VAPID_PUBLIC_KEY,
  _VAPID_PRIVATE_KEY
)

serve(async (req) => {
  try {
    const { title, body, url } = await req.json()
    
    // 1. Inicializar Supabase Client (usando variáveis internas da Edge Function)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Buscar todas as subscrições ativas
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')

    if (error) throw error

    // 3. Enviar para cada subscrição
    const notifications = subscriptions.map((sub: any) => {
      return webpush.sendNotification(
        sub.subscription,
        JSON.stringify({ title, body, url })
      ).catch(err => {
        console.error('Falha ao enviar para uma subscrição:', err)
        // Opcional: remover subscrição se expirar (status 410)
      })
    })

    await Promise.all(notifications)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 400 
    })
  }
})
