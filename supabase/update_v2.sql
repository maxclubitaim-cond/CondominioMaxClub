-- Atualização de Banco de Dados: MaxClubItaim-v2 (Fase 2)
-- Data: 06/04/2026

-- 1. Criação do Módulo de Pulseiras
CREATE TABLE IF NOT EXISTS solicitacoes_pulseiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade >= 1 AND quantidade <= 2),
    data_uso DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENTREGUE', 'CANCELADO')),
    nome_visitante TEXT, -- Opcional, mas útil
    created_at TIMESTAMPTZ DEFAULT NOW(),
    entregue_em TIMESTAMPTZ,
    entregue_por UUID REFERENCES perfis(id)
);

-- Habilitar RLS
ALTER TABLE solicitacoes_pulseiras ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Pulseiras
DROP POLICY IF EXISTS "Inserção pública de solicitações de pulseira" ON solicitacoes_pulseiras;
CREATE POLICY "Inserção pública de solicitações de pulseira" 
    ON solicitacoes_pulseiras FOR INSERT 
    WITH CHECK (true); -- Permitir que moradores solicitem sem login (seguindo padrão do projeto)

DROP POLICY IF EXISTS "Leitura pública de solicitações de pulseira" ON solicitacoes_pulseiras;
CREATE POLICY "Leitura pública de solicitações de pulseira" 
    ON solicitacoes_pulseiras FOR SELECT 
    USING (true); -- Permitir leitura para verificação na portaria

DROP POLICY IF EXISTS "Gestores podem gerenciar pulseiras" ON solicitacoes_pulseiras;
CREATE POLICY "Gestores podem gerenciar pulseiras" 
    ON solicitacoes_pulseiras FOR ALL 
    TO authenticated
    USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- 2. Reforço de Segurança Administrativa (Blindagem de Notificações e Perfis)

-- Garantir que apenas GESTOR/ADM podem mudar perfil de usuários
DROP POLICY IF EXISTS "Apenas GESTOR e ADM alteram perfis" ON perfis;
CREATE POLICY "Apenas GESTOR e ADM alteram perfis" 
    ON perfis FOR UPDATE 
    TO authenticated
    USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('GESTOR', 'ADM'))))
    WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('GESTOR', 'ADM'))));

-- Garantir que avisos (que podem disparar notificações) sejam criados apenas por equipe autorizada
DROP POLICY IF EXISTS "Equipe gestora pode gerenciar avisos" ON avisos;
CREATE POLICY "Equipe gestora pode gerenciar avisos" 
    ON avisos FOR ALL 
    TO authenticated
    USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
    WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- 3. Adicionar campo de controle para Vôlei (Opcional, para auditoria)
-- A lógica de dias alternados será implementada no Frontend primeiramente, 
-- mas podemos adicionar um comentário ou campo se necessário no futuro.
