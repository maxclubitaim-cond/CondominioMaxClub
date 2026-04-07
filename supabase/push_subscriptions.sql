-- Tabela para armazenar subscrições de WebPush
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.perfis(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem gerenciar suas próprias subscrições
CREATE POLICY "Usuários gerenciam suas próprias push subscrições"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);
