-- 1. Criar função segura para buscar locais sem expor senhas
CREATE OR REPLACE FUNCTION get_locais_publicos()
RETURNS TABLE (id uuid, nome text) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.nome
  FROM locais l
  WHERE l.tipo = 'ACESSO' AND l.ativo = true
  ORDER BY l.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_locais_publicos TO anon, authenticated;

-- 2. Criar função segura para registrar o acesso e DEVOLVER a senha
CREATE OR REPLACE FUNCTION registrar_acesso_obter_senha(
  p_unidade text,
  p_nome_morador text,
  p_local_id uuid
) RETURNS json AS $$
DECLARE
  v_senha_atual text;
  v_resultado json;
BEGIN
  -- Verificar se o local existe e está ativo
  SELECT senha_atual INTO v_senha_atual
  FROM locais
  WHERE id = p_local_id AND ativo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Local inválido ou inativo.';
  END IF;

  -- Registrar o acesso
  INSERT INTO registros_acesso (unidade, nome_morador, local_id)
  VALUES (p_unidade, p_nome_morador, p_local_id);

  -- Construir o JSON de retorno
  v_resultado := json_build_object(
    'senha_atual', v_senha_atual
  );

  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION registrar_acesso_obter_senha TO anon, authenticated;
