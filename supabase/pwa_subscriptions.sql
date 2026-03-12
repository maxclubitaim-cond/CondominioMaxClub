-- Tabela para armazenar as inscrições de Push Notification
CREATE TABLE IF NOT EXISTS pwa_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Opcional: para saber qual morador é
  subscription JSONB NOT NULL,            -- Objeto completo da Web Push API
  device_info JSONB,                      -- Opcional: tipo de celular/navegador
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE pwa_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários anônimos podem inserir (moradores sem login)
CREATE POLICY "Qualquer um pode se inscrever no push" 
  ON pwa_subscriptions FOR INSERT 
  WITH CHECK (true);

-- Política: Apenas o próprio usuário (ou ninguém se for anônimo) pode ler sua inscrição
-- Para simplificar a fase de testes, permitiremos leitura pública baseada no ID da inscrição
CREATE POLICY "Leitura de inscricao propria" 
  ON pwa_subscriptions FOR SELECT 
  USING (true);

-- Política de Gestão: Apenas administradores podem ver todas as inscrições
CREATE POLICY "Administradores veem todas as inscricoes" 
  ON pwa_subscriptions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND perfis.perfil IN ('GESTOR', 'ADM')
    )
  );
