-- ==========================================
-- FASE 8: Módulo de Classificados Internos
-- ==========================================

-- 1. Criação da Tabela
CREATE TABLE IF NOT EXISTS public.classificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2),
    categoria TEXT NOT NULL CHECK (categoria IN ('VENDA', 'DOACAO', 'TROCA')),
    contato TEXT NOT NULL,
    imagem_url TEXT,
    status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'VENDIDO', 'INATIVO')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;

-- Policy Pública: Qualquer um pode ler classificados ativos
DROP POLICY IF EXISTS "Publico pode ver classificados ativos" ON public.classificados;
CREATE POLICY "Publico pode ver classificados ativos"
ON public.classificados
FOR SELECT
TO public
USING (status = 'ATIVO');


-- ==========================================
-- 2. Funções RPC (Security Definer) para Moradores
-- ==========================================

-- Função: Listar os Próprios Classificados
CREATE OR REPLACE FUNCTION public.morador_listar_meus_classificados(p_unidade TEXT)
RETURNS SETOF public.classificados AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM public.classificados 
  WHERE UPPER(unidade) = UPPER(p_unidade)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Criar Novo Classificado
CREATE OR REPLACE FUNCTION public.morador_criar_classificado(
    p_unidade TEXT,
    p_titulo TEXT,
    p_descricao TEXT,
    p_preco NUMERIC,
    p_categoria TEXT,
    p_contato TEXT,
    p_imagem_url TEXT
)
RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
BEGIN
    INSERT INTO public.classificados (
        unidade, titulo, descricao, preco, categoria, contato, imagem_url, status
    )
    VALUES (
        p_unidade, p_titulo, p_descricao, p_preco, p_categoria, p_contato, p_imagem_url, 'ATIVO'
    )
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Alterar Status (Ex: Marcar como Vendido ou Inativo)
CREATE OR REPLACE FUNCTION public.morador_alterar_status_classificado(
    p_unidade TEXT,
    p_classificado_id UUID,
    p_novo_status TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE public.classificados
    SET status = p_novo_status,
        updated_at = now()
    WHERE id = p_classificado_id 
      AND UPPER(unidade) = UPPER(p_unidade);
      
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Anúncio não encontrado ou você não tem permissão para editá-lo.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função: Excluir Classificado
CREATE OR REPLACE FUNCTION public.morador_excluir_classificado(
    p_unidade TEXT,
    p_classificado_id UUID
)
RETURNS void AS $$
BEGIN
    DELETE FROM public.classificados
    WHERE id = p_classificado_id 
      AND UPPER(unidade) = UPPER(p_unidade);
      
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Anúncio não encontrado ou você não tem permissão para excluí-lo.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Storage Bucket para Imagens (Classificados)
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('classificados', 'classificados', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Publico pode ver imagens de classificados" ON storage.objects;
CREATE POLICY "Publico pode ver imagens de classificados" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'classificados' );

DROP POLICY IF EXISTS "Publico pode subir imagens de classificados" ON storage.objects;
CREATE POLICY "Publico pode subir imagens de classificados" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'classificados' );

DROP POLICY IF EXISTS "Publico pode deletar imagens de classificados" ON storage.objects;
CREATE POLICY "Publico pode deletar imagens de classificados" 
ON storage.objects FOR DELETE
TO public 
USING ( bucket_id = 'classificados' );

-- Atualizar cache do PostgREST
NOTIFY pgrst, 'reload schema';
