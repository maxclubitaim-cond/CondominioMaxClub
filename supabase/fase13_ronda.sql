-- ==================================================
-- FASE 13: Módulo de Ronda Predial
-- ==================================================

-- 1. Criação das Tabelas

CREATE TABLE locais_ronda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ronda_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_ronda_id UUID REFERENCES locais_ronda(id) ON DELETE CASCADE,
  operador_id UUID REFERENCES perfis(id),
  status_ok BOOLEAN NOT NULL,
  relato TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Políticas de Segurança (RLS)

ALTER TABLE locais_ronda ENABLE ROW LEVEL SECURITY;
ALTER TABLE ronda_registros ENABLE ROW LEVEL SECURITY;

-- Leitura: Qualquer usuário autenticado pode ler locais da ronda (para popular a lista)
CREATE POLICY "Leitura de locais_ronda para usuários autenticados" 
  ON locais_ronda FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Gestores e ADMs podem gerenciar locais de ronda
CREATE POLICY "Gestão de locais_ronda para GESTOR/ADM" 
  ON locais_ronda FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('GESTOR', 'ADM'))
    )
  );

-- Leitura de registros: Operadores, Gestores e ADMs
CREATE POLICY "Leitura de ronda_registros permitida" 
  ON ronda_registros FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM'))
    )
  );

-- Inserção de registros: Operadores, Gestores e ADMs
CREATE POLICY "Inserção de ronda_registros" 
  ON ronda_registros FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM'))
    )
  );

-- 3. Inserção de dados iniciais de exemplo para locais da ronda
INSERT INTO locais_ronda (nome, ordem) VALUES
('Portaria Principal', 1),
('Hall de Entrada', 2),
('Garagem Subsolo 1', 3),
('Garagem Subsolo 2', 4),
('Área da Piscina', 5),
('Academia', 6),
('Salão de Festas', 7),
('Cobertura/Barrilete', 8);

-- 4. Criação do Bucket de Storage (Requer permissão de superuser/dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('rondas', 'rondas', true);

-- Políticas de Storage para o bucket 'rondas'
-- CREATE POLICY "Acesso público às fotos das rondas" ON storage.objects FOR SELECT USING (bucket_id = 'rondas');
-- CREATE POLICY "Upload para rondas restrito a equipe" ON storage.objects FOR INSERT WITH CHECK (
--  bucket_id = 'rondas' AND auth.role() = 'authenticated'
-- );
