-- RPC para o morador visualizar suas vagas (próprias e alugadas)
CREATE OR REPLACE FUNCTION obter_vagas_morador(p_unidade TEXT)
RETURNS SETOF vagas AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM vagas
    WHERE unidade_dona = p_unidade 
       OR unidade_alugou = p_unidade
    ORDER BY subsolo ASC, numero ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
