-- Esquema de Banco de Dados: MaxClubItaim-v2

-- 1. Perfis Administrativos (Apenas GESTOR, OPERADOR, ADM)
CREATE TYPE user_perfil AS ENUM ('OPERADOR', 'GESTOR', 'ADM');

CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT,
  perfil user_perfil NOT NULL DEFAULT 'OPERADOR',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Locais (Apenas ACESSO agora)
CREATE TABLE locais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ACESSO', -- ACESSO ou outro futuro
  ativo BOOLEAN DEFAULT TRUE,
  senha_atual TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1 Locais para Limpeza [NOVO]
CREATE TABLE locais_limpeza (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Registros de Limpeza (Vinculado a locais_limpeza)
CREATE TABLE limpeza_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locais_limpeza(id),
  data_limpeza TIMESTAMPTZ DEFAULT NOW(),
  nome_operador TEXT NOT NULL,
  proxima_limpeza DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registros de Acesso (Moradores)
CREATE TABLE registros_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  nome_morador TEXT NOT NULL,
  local_id UUID REFERENCES locais(id),
  data_uso TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vagas de Garagem
CREATE TABLE vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  subsolo INTEGER CHECK (subsolo IN (1, 2)) NOT NULL DEFAULT 1,
  unidade_dona TEXT NOT NULL,
  unidade_alugou TEXT, -- Unidade que alugou a vaga
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Histórico de Sorteio
CREATE TABLE sorteio_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT 'Sorteio Sem Título',
  data_sorteio TIMESTAMPTZ DEFAULT NOW(),
  resultado JSONB NOT NULL, -- Mapa de Unidade -> Vaga
  responsavel UUID REFERENCES perfis(id),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Agenda do Prédio
CREATE TABLE agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  titulo TEXT NOT NULL,
  local TEXT,
  observacao TEXT,
  criado_por UUID REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Sugestões e Melhorias
CREATE TABLE sugestoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  texto TEXT NOT NULL CHECK (char_length(texto) <= 300),
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Avisos (Painel Principal)
CREATE TABLE avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  imagem_url TEXT,
  descricao TEXT NOT NULL CHECK (char_length(descricao) <= 300),
  data_fim TIMESTAMPTZ,
  criado_por UUID REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reservas Rede de Vôlei
CREATE TABLE reservas_volei (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade TEXT NOT NULL,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  entregue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Achados e Perdidos
CREATE TABLE achados_perdidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  imagem_url TEXT,
  data_registro TIMESTAMPTZ DEFAULT NOW(),
  retirado BOOLEAN DEFAULT FALSE,
  registrado_por UUID REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Trigger para criar perfil automaticamente ao cadastrar no Auth
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Configurações de RLS (Row Level Security) - Simplificado para desenvolvimento
-- Permitir leitura pública para algumas tabelas (moradores e home)
ALTER TABLE achados_perdidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de achados perdidos não retirados" 
  ON achados_perdidos FOR SELECT USING (retirado = false);
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de avisos" ON avisos FOR SELECT USING (true);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de agenda" ON agenda FOR SELECT USING (true);

ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de locais" ON locais FOR SELECT USING (true);
CREATE POLICY "Gestores e ADMs podem atualizar locais" 
  ON locais FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM'))
    )
  );

CREATE POLICY "Gestores e ADMs podem criar locais" 
  ON locais FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM'))
    )
  );

CREATE POLICY "Gestores e ADMs podem deletar locais" 
  ON locais FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND (perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM'))
    )
  );


-- 13. Políticas de RLS Adicionais para Gestão (Explicitadas)

-- Perfis: Leitura pública e gestão por ADM/GESTOR
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de perfis" ON perfis;
CREATE POLICY "Leitura pública de perfis" ON perfis FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestores e ADMs podem atualizar perfis" ON perfis;
CREATE POLICY "Gestores e ADMs podem atualizar perfis" 
  ON perfis FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('GESTOR', 'ADM'))));

-- Vagas: Leitura pública e gestão explicita (ADM, GESTOR, OPERADOR)
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de vagas" ON vagas;
CREATE POLICY "Leitura pública de vagas" ON vagas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar vagas" ON vagas;
CREATE POLICY "Equipe gestora pode gerenciar vagas" 
  ON vagas FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Agenda: Gestão explicita (ADM, GESTOR, OPERADOR)
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar agenda" ON agenda;
CREATE POLICY "Equipe gestora pode gerenciar agenda" 
  ON agenda FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Avisos: Gestão explicita (ADM, GESTOR, OPERADOR)
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar avisos" ON avisos;
CREATE POLICY "Equipe gestora pode gerenciar avisos" 
  ON avisos FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Achados e Perdidos: Gestão explicita (ADM, GESTOR, OPERADOR)
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar achados_perdidos" ON achados_perdidos;
CREATE POLICY "Equipe gestora pode gerenciar achados_perdidos" 
  ON achados_perdidos FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Registros de Limpeza: Gestão explicita e Leitura Pública
ALTER TABLE limpeza_registros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de limpeza_registros" ON limpeza_registros;
CREATE POLICY "Leitura pública de limpeza_registros" ON limpeza_registros FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar limpeza_registros" ON limpeza_registros;
CREATE POLICY "Equipe gestora pode gerenciar limpeza_registros" 
  ON limpeza_registros FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Locais de Limpeza: Gestão explicita
ALTER TABLE locais_limpeza ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de locais_limpeza" ON locais_limpeza;
CREATE POLICY "Leitura pública de locais_limpeza" ON locais_limpeza FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar locais_limpeza" ON locais_limpeza;
CREATE POLICY "Equipe gestora pode gerenciar locais_limpeza" 
  ON locais_limpeza FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));

-- Sorteios: Gestão explicita
ALTER TABLE sorteio_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de sorteios" ON sorteio_historico;
CREATE POLICY "Leitura pública de sorteios" ON sorteio_historico FOR SELECT USING (true);
DROP POLICY IF EXISTS "Gestores e ADMs podem gerenciar sorteios" ON sorteio_historico;
CREATE POLICY "Equipe gestora pode gerenciar sorteios" 
  ON sorteio_historico FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND (perfil IN ('OPERADOR', 'GESTOR', 'ADM'))));
