-- Criar tabela genérica de configurações do sistema
CREATE TABLE public.configuracoes_sistema (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Permitir leitura pública"
ON public.configuracoes_sistema FOR SELECT
USING (true);

CREATE POLICY "Permitir atualização para GESTOR e ADM"
ON public.configuracoes_sistema FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfis
        WHERE perfis.id = auth.uid()
        AND perfis.perfil IN ('GESTOR', 'ADM')
    )
);

CREATE POLICY "Permitir inserção para GESTOR e ADM"
ON public.configuracoes_sistema FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.perfis
        WHERE perfis.id = auth.uid()
        AND perfis.perfil IN ('GESTOR', 'ADM')
    )
);

-- Inserir o registro padrão para o vôlei
INSERT INTO public.configuracoes_sistema (chave, valor)
VALUES ('volei_modo', 'todos')
ON CONFLICT (chave) DO NOTHING;
