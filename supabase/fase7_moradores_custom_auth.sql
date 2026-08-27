-- Extensão necessária para criptografia Bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Criação da Tabela Interna de Moradores
CREATE TABLE IF NOT EXISTS public.moradores_auth (
    unidade TEXT PRIMARY KEY,
    senha_hash TEXT NOT NULL,
    primeiro_acesso BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Segurança: Ninguém pode ler a tabela diretamente sem permissão.
-- Tudo será feito via Funções (RPC).
ALTER TABLE public.moradores_auth ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas Gestores Podem Ler Tabela" ON public.moradores_auth;
CREATE POLICY "Apenas Gestores Podem Ler Tabela"
ON public.moradores_auth
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')
  )
);

-- ==========================================
-- 2. FUNÇÕES RPC (SECURITY DEFINER)
-- Essas funções ignoram o RLS para que possamos fazer a checagem da senha com segurança.
-- ==========================================

-- Função para GESTOR criar uma nova unidade
CREATE OR REPLACE FUNCTION public.criar_morador_interno(p_unidade TEXT, p_senha TEXT) RETURNS void AS $$
BEGIN
  -- Verifica se é Gestor/Adm
  IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas gestores podem cadastrar unidades.';
  END IF;

  INSERT INTO public.moradores_auth (unidade, senha_hash, primeiro_acesso)
  VALUES (p_unidade, crypt(p_senha, gen_salt('bf')), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para MORADOR Fazer Login
CREATE OR REPLACE FUNCTION public.login_morador(p_unidade TEXT, p_senha TEXT)
RETURNS JSON AS $$
DECLARE
  v_morador public.moradores_auth;
BEGIN
  -- Busca morador ignorando maiúscula/minúscula na unidade (ex: 101a == 101A)
  SELECT * INTO v_morador FROM public.moradores_auth WHERE UPPER(unidade) = UPPER(p_unidade) AND ativo = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unidade não encontrada ou inativa.';
  END IF;

  -- Compara a senha digitada com a Hash gravada no banco
  IF v_morador.senha_hash = crypt(p_senha, v_morador.senha_hash) THEN
    RETURN json_build_object(
      'unidade', v_morador.unidade,
      'primeiro_acesso', v_morador.primeiro_acesso
    );
  ELSE
    RAISE EXCEPTION 'Senha incorreta.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para Morador Trocar a Própria Senha
CREATE OR REPLACE FUNCTION public.alterar_senha_morador(p_unidade TEXT, p_senha_atual TEXT, p_nova_senha TEXT)
RETURNS void AS $$
DECLARE
  v_morador public.moradores_auth;
BEGIN
  SELECT * INTO v_morador FROM public.moradores_auth WHERE UPPER(unidade) = UPPER(p_unidade);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unidade não encontrada.';
  END IF;

  IF v_morador.senha_hash = crypt(p_senha_atual, v_morador.senha_hash) THEN
    UPDATE public.moradores_auth
    SET senha_hash = crypt(p_nova_senha, gen_salt('bf')),
        primeiro_acesso = false
    WHERE UPPER(unidade) = UPPER(p_unidade);
  ELSE
    RAISE EXCEPTION 'Senha atual incorreta.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para GESTOR Resetar Senha do Morador
CREATE OR REPLACE FUNCTION public.gestor_resetar_senha_morador(p_unidade TEXT, p_nova_senha TEXT)
RETURNS void AS $$
BEGIN
  -- Verifica permissão
  IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas gestores podem resetar senhas.';
  END IF;

  UPDATE public.moradores_auth
  SET senha_hash = crypt(p_nova_senha, gen_salt('bf')),
      primeiro_acesso = true
  WHERE UPPER(unidade) = UPPER(p_unidade);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para GESTOR Excluir Morador
CREATE OR REPLACE FUNCTION public.gestor_excluir_morador(p_unidade TEXT)
RETURNS void AS $$
BEGIN
  -- Verifica permissão
  IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas gestores podem excluir unidades.';
  END IF;

  DELETE FROM public.moradores_auth
  WHERE UPPER(unidade) = UPPER(p_unidade);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 3. TABELA DE ENCOMENDAS
-- (Garantindo que ela exista antes de criar a função)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.encomendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade TEXT NOT NULL,
    descricao TEXT NOT NULL,
    codigo_rastreio TEXT,
    status TEXT DEFAULT 'PENDENTE',
    recebido_por_operador_id UUID REFERENCES public.perfis(id),
    entregue_por_operador_id UUID REFERENCES public.perfis(id),
    data_recebimento TIMESTAMPTZ DEFAULT now(),
    data_entrega TIMESTAMPTZ
);

ALTER TABLE public.encomendas ENABLE ROW LEVEL SECURITY;

-- Permissões básicas para os gestores lerem as encomendas
DROP POLICY IF EXISTS "Gestores podem gerenciar encomendas" ON public.encomendas;
CREATE POLICY "Gestores podem gerenciar encomendas"
ON public.encomendas
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM', 'OPERADOR')
  )
);

-- ==========================================
-- 4. PERMISSÕES PARA MORADORES (ACESSO ANON)
-- ==========================================

-- Função para o morador buscar suas encomendas sem precisar do token Supabase Auth
CREATE OR REPLACE FUNCTION public.obter_encomendas_morador(p_unidade TEXT)
RETURNS SETOF public.encomendas AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM public.encomendas 
  WHERE UPPER(unidade) = UPPER(p_unidade) 
  AND status = 'PENDENTE'
  ORDER BY data_recebimento DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar cache do PostgREST novamente
NOTIFY pgrst, 'reload schema';
