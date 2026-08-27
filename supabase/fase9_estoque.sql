-- ==========================================
-- FASE 9: Controle de Estoque
-- ==========================================

-- 1. Tabela de Itens de Estoque
CREATE TABLE IF NOT EXISTS public.estoque_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    quantidade_atual INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 0,
    unidade_medida TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.estoque_itens(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    manutencao_id UUID REFERENCES public.manutencao_registros(id) ON DELETE SET NULL,
    data_movimentacao TIMESTAMPTZ DEFAULT now(),
    responsavel_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    observacao TEXT
);

-- 3. Alterar tabela de manutenção para incluir itens usados
ALTER TABLE public.manutencao_registros ADD COLUMN IF NOT EXISTS itens_usados JSONB DEFAULT '[]'::jsonb;

-- 4. Habilitar RLS
ALTER TABLE public.estoque_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

-- 5. Policies de Segurança
-- Apenas ADM e GESTOR podem gerenciar estoque
CREATE POLICY "Gestão gerencia itens de estoque"
ON public.estoque_itens
FOR ALL
USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')));

CREATE POLICY "Gestão gerencia movimentacoes de estoque"
ON public.estoque_movimentacoes
FOR ALL
USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')));


-- 5. RPC para registrar manutenção com consumo de estoque
-- Essa função recebe o JSON da manutenção e o JSON dos itens de estoque consumidos
-- itens_estoque deve ser um array JSON do tipo: [{"item_id": "uuid", "quantidade": 2}]
CREATE OR REPLACE FUNCTION public.registrar_manutencao_com_estoque(
    p_area_nome TEXT,
    p_responsavel_tecnico TEXT,
    p_descricao TEXT,
    p_fotos_antes JSONB,
    p_fotos_depois JSONB,
    p_observacoes TEXT,
    p_itens_estoque JSONB
) RETURNS UUID AS $$
DECLARE
    v_manutencao_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_quantidade INTEGER;
BEGIN
    -- 0. Verifica permissão para escalar segurança da RPC
    IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Gestores ou ADMs podem registrar manutenção com estoque.';
    END IF;

    -- 1. Insere o registro de manutenção
    INSERT INTO public.manutencao_registros (
        area_nome, responsavel_tecnico, descricao, 
        fotos_antes, fotos_depois, realizado_por, observacoes, itens_usados
    ) VALUES (
        p_area_nome, p_responsavel_tecnico, p_descricao, 
        p_fotos_antes, p_fotos_depois, auth.uid(), p_observacoes, p_itens_estoque
    ) RETURNING id INTO v_manutencao_id;

    -- 2. Processa os itens de estoque (se houver)
    IF p_itens_estoque IS NOT NULL AND jsonb_array_length(p_itens_estoque) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens_estoque)
        LOOP
            v_item_id := (v_item->>'item_id')::UUID;
            v_quantidade := (v_item->>'quantidade')::INTEGER;

            -- Registra a movimentação de SAÍDA
            INSERT INTO public.estoque_movimentacoes (
                item_id, quantidade, tipo, manutencao_id, responsavel_id, observacao
            ) VALUES (
                v_item_id, v_quantidade, 'SAIDA', v_manutencao_id, auth.uid(), 'Uso na manutenção ' || v_manutencao_id
            );

            -- Deduz do saldo do item
            UPDATE public.estoque_itens
            SET quantidade_atual = quantidade_atual - v_quantidade,
                updated_at = now()
            WHERE id = v_item_id;
        END LOOP;
    END IF;

    RETURN v_manutencao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC para listar movimentações enriquecidas com o nome do item e o nome do responsável
CREATE OR REPLACE FUNCTION public.listar_movimentacoes_estoque()
RETURNS TABLE (
    id UUID,
    item_nome TEXT,
    unidade_medida TEXT,
    quantidade INTEGER,
    tipo TEXT,
    data_movimentacao TIMESTAMPTZ,
    observacao TEXT,
    responsavel_nome TEXT
) AS $$
BEGIN
    -- 0. Verifica permissão
    IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Gestores ou ADMs podem listar movimentações de estoque.';
    END IF;

    RETURN QUERY
    SELECT 
        m.id,
        i.nome AS item_nome,
        i.unidade_medida,
        m.quantidade,
        m.tipo,
        m.data_movimentacao,
        m.observacao,
        p.nome AS responsavel_nome
    FROM public.estoque_movimentacoes m
    JOIN public.estoque_itens i ON m.item_id = i.id
    LEFT JOIN public.perfis p ON m.responsavel_id = p.id
    ORDER BY m.data_movimentacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar cache do PostgREST
NOTIFY pgrst, 'reload schema';
