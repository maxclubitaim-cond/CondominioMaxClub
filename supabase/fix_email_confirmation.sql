-- Função para confirmar o e-mail de um usuário recém-criado,
-- garantindo que ele não precise confirmar por e-mail e não dê erro 400 ao logar.
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Verificar permissão (apenas GESTOR ou ADM)
  IF NOT EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: Apenas GESTORES e ADMs podem confirmar usuários.';
  END IF;

  -- Confirmar o e-mail na tabela do Supabase Auth
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
