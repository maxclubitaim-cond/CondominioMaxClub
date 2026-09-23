-- Criar tabela de registro de limpeza da piscina
CREATE TABLE public.limpeza_piscina (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ph NUMERIC,
    cloro NUMERIC,
    alcalinidade NUMERIC,
    fotos_antes JSONB DEFAULT '[]'::jsonb,
    fotos_depois JSONB DEFAULT '[]'::jsonb,
    operador_id UUID REFERENCES public.perfis(id),
    data_registro TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.limpeza_piscina ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Permitir leitura para todos os usuários autenticados"
ON public.limpeza_piscina FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para OPERADOR, GESTOR e ADM"
ON public.limpeza_piscina FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.perfis
        WHERE perfis.id = auth.uid()
        AND perfis.perfil IN ('OPERADOR', 'GESTOR', 'ADM')
    )
);

CREATE POLICY "Permitir exclusão apenas para GESTOR e ADM"
ON public.limpeza_piscina FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfis
        WHERE perfis.id = auth.uid()
        AND perfis.perfil IN ('GESTOR', 'ADM')
    )
);

-- Configuração do Storage (Bucket para imagens da piscina)
-- Descomente e rode se o bucket 'piscina' ainda não existir
INSERT INTO storage.buckets (id, name, public) VALUES ('piscina', 'piscina', true);

-- Políticas de Storage
-- Permitir leitura pública das imagens
 CREATE POLICY "Permitir visualização pública de imagens da piscina" 
 ON storage.objects FOR SELECT 
 USING ( bucket_id = 'piscina' );

-- Permitir upload para usuários autenticados
 CREATE POLICY "Permitir upload para usuários autenticados na piscina" 
 ON storage.objects FOR INSERT 
 TO authenticated 
 WITH CHECK ( bucket_id = 'piscina' );

-- Permitir deleção para usuários autenticados (opcional, pode restringir mais)
 CREATE POLICY "Permitir deleção de imagens na piscina" 
 ON storage.objects FOR DELETE 
 TO authenticated 
 USING ( bucket_id = 'piscina' );
