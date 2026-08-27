-- ==========================================
-- Migração Fase 6: Portal do Morador e Primeiro Acesso
-- Execute este script no painel SQL do Supabase.
-- ==========================================

-- 1. Adicionar Perfil MORADOR ao Enum (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_perfil' AND e.enumlabel = 'MORADOR') THEN
        ALTER TYPE user_perfil ADD VALUE 'MORADOR';
    END IF;
END $$;

-- 2. Adicionar coluna `primeiro_acesso` na tabela `perfis`
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT TRUE;

-- 3. Função para o GESTOR/ADM Resetar a Senha de um Morador
CREATE OR REPLACE FUNCTION public.admin_reset_password(user_id UUID, new_password TEXT)
RETURNS void AS $$
BEGIN
  -- Verificar permissão (apenas GESTOR ou ADM)
  IF NOT EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas GESTORES e ADMs podem resetar senhas.';
  END IF;

  -- Atualizar a senha no auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  -- Resetar a flag de primeiro acesso, já que o gestor forneceu uma nova senha
  UPDATE public.perfis
  SET primeiro_acesso = TRUE
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Função para o GESTOR/ADM Criar um Morador
CREATE OR REPLACE FUNCTION public.admin_create_resident(unidade_numero TEXT, senha_inicial TEXT)
RETURNS UUID AS $$
DECLARE
  novo_id UUID;
  email_formatado TEXT;
BEGIN
  -- Verificar permissão (apenas GESTOR ou ADM)
  IF NOT EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas GESTORES e ADMs podem criar moradores.';
  END IF;

  email_formatado := unidade_numero || '@maxclub.com.br';

  -- Verificar se já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_formatado) THEN
    RAISE EXCEPTION 'Unidade já cadastrada.';
  END IF;

  novo_id := gen_random_uuid();

  -- Inserir no auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', novo_id, 'authenticated', 'authenticated', 
    email_formatado, crypt(senha_inicial, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', 
    jsonb_build_object('nome', 'Morador ' || unidade_numero), 
    now(), now()
  );

  -- Inserir no auth.identities para permitir o login pelo GoTrue
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), novo_id, 
    jsonb_build_object('sub', novo_id, 'email', email_formatado), 
    'email', novo_id::text, now(), now(), now()
  );

  -- O trigger 'on_auth_user_created' vai criar o perfil automaticamente como 'OPERADOR'.
  -- Precisamos alterar esse perfil para 'MORADOR'.
  UPDATE public.perfis 
  SET perfil = 'MORADOR', nome = 'Unidade ' || unidade_numero, primeiro_acesso = TRUE
  WHERE id = novo_id;

  RETURN novo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
