-- ==========================================
-- SCHEMA DE PRODUÇÃO CONSOLIDADO: MaxClub Itaim
-- Versão: 2.0 (Fase de Encerramento)
-- Data: 07/04/2026
-- ==========================================

-- 1. TIPOS CUSTOMIZADOS
CREATE TYPE user_perfil AS ENUM ('OPERADOR', 'GESTOR', 'ADM');

-- 2. TABELA DE PERFIS (Integrada ao Auth)
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  perfil user_perfil NOT NULL DEFAULT 'OPERADOR',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GESTÃO DE ACESSOS (Portões/Senhas)
CREATE TABLE locais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ACESSO',
  ativo BOOLEAN DEFAULT TRUE,
  senha_atual TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HIGIENIZAÇÃO E LIMPEZA
CREATE TABLE locais_limpeza (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE limpeza_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locais_limpeza(id) ON DELETE CASCADE,
  data_limpeza TIMESTAMPTZ DEFAULT NOW(),
  nome_operador TEXT NOT NULL,
  proxima_limpeza DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REGISTROS DE USO (Moradores)
CREATE TABLE registros_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  nome_morador TEXT NOT NULL,
  local_id UUID REFERENCES locais(id) ON DELETE SET NULL,
  data_uso TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VAGAS E SORTEIO
CREATE TABLE vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  subsolo INTEGER CHECK (subsolo IN (1, 2)) NOT NULL DEFAULT 1,
  unidade_dona TEXT NOT NULL,
  unidade_alugou TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sorteio_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT 'Sorteio Sem Título',
  data_sorteio TIMESTAMPTZ DEFAULT NOW(),
  resultado JSONB NOT NULL,
  responsavel UUID REFERENCES perfis(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMUNICAÇÃO E EVENTOS
CREATE TABLE agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  titulo TEXT NOT NULL,
  local TEXT,
  observacao TEXT,
  criado_por UUID REFERENCES perfis(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  imagem_url TEXT,
  descricao TEXT NOT NULL CHECK (char_length(descricao) <= 300),
  data_fim TIMESTAMPTZ,
  criado_por UUID REFERENCES perfis(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FEEDBACK E APOIO
CREATE TABLE sugestoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  texto TEXT NOT NULL CHECK (char_length(texto) <= 300),
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achados_perdidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  imagem_url TEXT,
  data_registro TIMESTAMPTZ DEFAULT NOW(),
  retirado BOOLEAN DEFAULT FALSE,
  registrado_por UUID REFERENCES perfis(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ESPORTES E LAZER
CREATE TABLE reservas_volei (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  entregue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PULSEIRAS DE PISCINA
CREATE TABLE solicitacoes_pulseiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade >= 1 AND quantidade <= 2),
    data_uso DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENTREGUE', 'CANCELADO')),
    nome_visitante TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    entregue_em TIMESTAMPTZ,
    entregue_por UUID REFERENCES perfis(id) ON DELETE SET NULL
);

-- 11. AUDITORIA SALÃO DE FESTAS
CREATE TABLE salao_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  data_evento DATE NOT NULL,
  respostas JSONB NOT NULL,
  aderencia FLOAT NOT NULL,
  ocorrencias JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICAÇÕES PWA (WebPush)
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FUNÇÕES E TRIGGERS DE AUTOMAÇÃO
-- ==========================================

-- Trigger: Criar Perfil Automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email, perfil)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Novo Usuário'),
    new.email,
    'OPERADOR'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_limpeza ENABLE ROW LEVEL SECURITY;
ALTER TABLE limpeza_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorteio_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achados_perdidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_volei ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_pulseiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE salao_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Exemplo de Política: Acesso Equipe Gestora (Aplicação Genérica)
-- Nota: Em produção, aplique políticas específicas por tabela como no Itaim-v2.

-- Avisos: Público vê, Gestor edita
CREATE POLICY "Leitura pública de avisos" ON avisos FOR SELECT USING (true);
CREATE POLICY "Gestão de avisos" ON avisos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Pulseiras: Público insere, Portaria lê/atualiza
CREATE POLICY "Inserção pública de pulseiras" ON solicitacoes_pulseiras FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura pública de pulseiras" ON solicitacoes_pulseiras FOR SELECT USING (true);
CREATE POLICY "Gestão de pulseiras" ON solicitacoes_pulseiras FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Vôlei: Público insere, Portaria lê/atualiza
CREATE POLICY "Inserção pública vôlei" ON reservas_volei FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura pública vôlei" ON reservas_volei FOR SELECT USING (true);
CREATE POLICY "Gestão vôlei" ON reservas_volei FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Perfis: Segurança reforçada
CREATE POLICY "Leitura pública de perfis" ON perfis FOR SELECT USING (true);
CREATE POLICY "Gestão estratégica de perfis" ON perfis FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('GESTOR', 'ADM'))));

-- Sugestões: Somente Gestão vê
CREATE POLICY "Inserção pública sugestões" ON sugestoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Gestão secreta de sugestões" ON sugestoes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));
