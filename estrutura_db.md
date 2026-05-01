# Estrutura do Banco de Dados: MaxClubItaim-v2

Este documento detalha as tabelas, tipos e relacionamentos do sistema.

## Tabelas Principais

### 1. `perfis`
Armazena informações dos usuários administrativos.
- `id`: UUID (FK auth.users)
- `nome`: TEXT
- `perfil`: ENUM ('OPERADOR', 'GESTOR', 'ADM')
- `ativo`: BOOLEAN

### 2. `locais`
Controle de acessos e senhas.
- `id`: UUID
- `nome`: TEXT
- `senha_atual`: TEXT (Cuidado: Leitura pública habilitada no momento)

### 3. `agenda`
Eventos do condomínio.
- `data`: DATE
- `hora`: TIME
- `titulo`: TEXT
- `local`: TEXT

### 4. `limpeza_registros` & `locais_limpeza`
Controle de rotinas de higienização.
- `local_id`: FK locais_limpeza
- `nome_operador`: TEXT
- `proxima_limpeza`: DATE

### 5. `sugestoes`
Feedback dos moradores.
- `unidade`: TEXT
- `texto`: TEXT (max 300)
- `lido`: BOOLEAN

### 6. `achados_perdidos`
- `item`: TEXT
- `retirado`: BOOLEAN
- `imagem_url`: TEXT

### 7. `vagas` & `sorteio_historico`
Gestão de estacionamento.
- `numero`: TEXT
- `subsolo`: INTEGER
- `unidade_dona`: TEXT

### 8. `salao_checklist`
Registro de conformidade após eventos.
- `unidade`: TEXT
- `aderencia`: FLOAT
- `respostas`: JSONB

### 9. `solicitacoes_pulseiras` [NOVO]
Solicitação de convites para piscina.
- `unidade`: TEXT
- `quantidade`: INTEGER (Limite de 2)
- `data_uso`: DATE
- `status`: TEXT ('PENDENTE', 'ENTREGUE')
- `created_at`: TIMESTAMPTZ

### 10. `pwa_subscriptions` [NOVO]
Armazena as assinaturas de WebPush para notificações.
- `id`: UUID (PK)
- `user_id`: UUID (FK auth.users, opcional para visitantes)
- `subscription`: JSONB (Dados do endpoint, auth e p256dh)
- `user_agent`: TEXT
- `created_at`: TIMESTAMPTZ

### 11. `empreendedores` [NOVO]
Registro de serviços e produtos oferecidos por moradores.
- `id`: UUID (PK)
- `nome`: TEXT
- `unidade`: TEXT
- `tipo_servico`: TEXT
- `descricao`: TEXT (max 500)
- `fotos`: TEXT[] (URLs das imagens)
- `created_at`: TIMESTAMPTZ

## Tipos Customizados
- `user_perfil`: ENUM ('OPERADOR', 'GESTOR', 'ADM')

## Triggers
- `on_auth_user_created`: Cria automaticamente um perfil na tabela `perfis` quando um novo usuário se registra no Supabase Auth.
