import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webpush from "npm:web-push"

const VAPID_PUBLIC_KEY = "BJTvnnJigZoR42RhR5hCibuDjLmKDQ18WMYXVnO2en_MF_bXGRUrXgQ-fMGuVXE8l6RAsm41EuUKa470g3hinp0"
const VAPID_PRIVATE_KEY = "14Hh6mY8VQwDxLfI-BOTxt4-Y65c7x7TvfOHCvAq4nE" 
const GCM_API_KEY = "" // Opcional

webpush.setVapidDetails(
  'mailto:contato@maxclubitaim.com.br',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notification, subscriptions } = await req.json()

    if (!subscriptions || subscriptions.length === 0) {
       return new Response(
         JSON.stringify({ message: "Nenhuma assinatura fornecida." }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
    }

    const results = await Promise.all(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub, JSON.stringify({
            title: notification.title,
            body: notification.body,
            url: notification.url || '/'
          }))
          return { success: true }
        } catch (err: any) {
          console.error('Erro ao enviar para dispositivo:', err)
          return { success: false, error: err.message }
        }
      })
    )

    const successCount = results.filter(r => r.success).length

    return new Response(
      JSON.stringify({ count: successCount, total: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
