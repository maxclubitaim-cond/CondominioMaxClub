-- Módulo de Manutenção: Tabelas e RLS

-- 1. Áreas de Manutenção
CREATE TABLE manutencao_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Registros de Manutenção
CREATE TABLE manutencao_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_nome TEXT NOT NULL, -- Agora é texto livre
  responsavel_tecnico TEXT NOT NULL, -- Novo campo
  descricao TEXT NOT NULL,
  fotos_antes JSONB DEFAULT '[]'::jsonb,
  fotos_depois JSONB DEFAULT '[]'::jsonb,
  data_manutencao TIMESTAMPTZ DEFAULT NOW(),
  realizado_por UUID REFERENCES perfis(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Áreas Iniciais
INSERT INTO manutencao_areas (nome) VALUES 
('Elevador'), ('Portão Principal'), ('Piscina'), ('Iluminação Área Comum'), ('Portas Internas'), ('Interfone');

-- RLS para manutencao_areas
ALTER TABLE manutencao_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de manutencao_areas" ON manutencao_areas FOR SELECT USING (true);
CREATE POLICY "Gestão pode gerenciar manutencao_areas" 
  ON manutencao_areas FOR ALL 
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('GESTOR', 'ADM'))));

-- RLS para manutencao_registros
ALTER TABLE manutencao_registros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer autenticado da equipe pode ler registros" 
  ON manutencao_registros FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Equipe operacional pode criar registros" 
  ON manutencao_registros FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Bucket de Storage (manutencao)
-- Nota: O bucket deve ser criado manualmente no painel ou via RPC se disponível.
-- Políticas sugeridas para o bucket 'manutencao':
-- INSERT: auth.uid() IS NOT NULL
-- SELECT: true
