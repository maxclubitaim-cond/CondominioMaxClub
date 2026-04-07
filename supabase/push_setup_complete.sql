-- 1. Tabela de Subscrições WebPush (Ajustada)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.perfis(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_subscription UNIQUE(user_id, subscription)
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem gerenciar suas próprias subscrições
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias push subscrições" ON public.push_subscriptions;
CREATE POLICY "Usuários gerenciam suas próprias push subscrições"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- 2. Função de Banco para disparar Notificação (Post Request para Edge Function)
-- Nota: Você precisará configurar o URL da sua Edge Function aqui após o deploy.
CREATE OR REPLACE FUNCTION public.handle_new_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
BEGIN
    -- Montar o payload baseado na tabela
    IF (TG_TABLE_NAME = 'solicitacoes_pulseiras') THEN
        payload := json_build_object(
            'title', 'Nova Pulseira Solicitada',
            'body', 'Unidade ' || NEW.unidade || ' solicitou ' || NEW.quantidade || ' pulseiras.',
            'url', '/dashboard/pulseiras'
        );
    ELSIF (TG_TABLE_NAME = 'reservas_volei') THEN
        payload := json_build_object(
            'title', 'Novo Agendamento Vôlei',
            'body', 'Unidade ' || NEW.unidade || ' reservou a quadra.',
            'url', '/dashboard/volei'
        );
    END IF;

    -- Chamada HTTP para Edge Function (Preenchido com seus dados)
    PERFORM
      net.http_post(
        url := 'https://iubrpjatscyrerhzezxu.supabase.co/functions/v1/send-push',
        headers := jsonb_build_object(
            'Content-Type', 'application/json', 
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnJwamF0c2N5cmVyaHplenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzIyMjQsImV4cCI6MjA4ODQwODIyNH0.p7dr9-W4nXHVrGYehBCIqGytsrfXesBgf72Pi1lxeOA'
        ),
        body := payload::jsonb
      );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Triggers
DROP TRIGGER IF EXISTS trigger_notify_pulseiras ON public.solicitacoes_pulseiras;
CREATE TRIGGER trigger_notify_pulseiras
AFTER INSERT ON public.solicitacoes_pulseiras
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification_trigger();

DROP TRIGGER IF EXISTS trigger_notify_volei ON public.reservas_volei;
CREATE TRIGGER trigger_notify_volei
AFTER INSERT ON public.reservas_volei
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification_trigger();
