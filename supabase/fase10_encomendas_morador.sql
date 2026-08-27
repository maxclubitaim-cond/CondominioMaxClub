-- Função para o morador confirmar a retirada da própria encomenda
CREATE OR REPLACE FUNCTION public.confirmar_retirada_morador(p_encomenda_id UUID, p_unidade TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.encomendas 
  SET status = 'ENTREGUE', 
      data_entrega = now()
  WHERE id = p_encomenda_id AND UPPER(unidade) = UPPER(p_unidade);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar cache do PostgREST
NOTIFY pgrst, 'reload schema';
