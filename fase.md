# Planejamento de Fases: MaxClubItaim-v2

As fases abaixo definem o cronograma de desenvolvimento e melhorias do projeto.

## [x] Fase 1: Diagnóstico e Estruturação
- [x] Levantamento de módulos atuais.
- [x] Auditoria inicial de vulnerabilidades.
- [x] Criação de `fase.md` e `estrutura_db.md`.
- [x] Subida da aplicação no ambiente local.

## [x] Fase 2: Segurança e Regras de Negócio
- [x] Reforço de RLS para perfis GESTOR/ADM (Blindagem de notificações).
- [x] Implementação de lógica de **DIAS ALTERNADOS** para Vôlei (Início 09/04).
- [x] Criação do Módulo de **Pulseiras de Piscina** (Solicitação e Gestão).
- [x] Regra de Limite: Máximo 2 pulseiras por solicitação.
- [x] Padronização de Toasts e Modais de Confirmação.

## [x] Fase 3: Restauro e Consolidação Visual
- [x] Reversão da paleta para o **Laranja (Cor Oficial Permanente)**.
- [x] Restauro completo da `Home.jsx`, `Dashboard.jsx`, `PoolPasses.jsx` e `Login.jsx`.
- [x] Padronização de Sombras Confortáveis (`shadow-sm`) e Arredondamentos `3xl`.
- [x] Limpeza de resquícios de tipografia `font-black` e cores experimentais.
- [x] Verificação de contraste e legibilidade em todos os módulos.
- [x] Refinamento dos Módulos de **Pulseiras** e **Vôlei** (Design Clássico).
- [x] Portal de Login laranja original restabelecido.
- [x] Ajuste de Permissões de Acesso para OPERADOR (Vagas Liberado, Acessos Restrito).
- [x] Alteração terminológica de 'Feedback' para 'Sugestões' em todo o sistema.

## [x] Fase 4: Novas Funcionalidades e Homologação
- [x] Correção de responsividade na `Home.jsx` (Status Sidebar visível no mobile).
- [x] Implementação de Scroll Suave e Correção de Navegação (Avisos/Mobile).
- [x] Padronização de Rótulos de Navegação ("Voltar").
- [x] Correção de Scroll para o Topo em navegação de páginas.
- [x] Implementação de Notificações PWA (WebPush).
- [x] Profissionalização da Interface (UX/UI).
- [x] Geração de Relatórios de Limpeza e Acessos em PDF.

## [x] Fase 5: Ajustes de Manutenção e Estabilidade
- [x] Correção do Histórico de Manutenção (Bug de Join inexistente).
- [x] Implementação do Registro de Tratamento de Piscina (pH, cloro, alcalinidade e fotos).
- [x] Mecanismo de configuração da liberação da rede de vôlei (Livre vs Alternado).
- [x] Testes de maturidade de código (`code-maturity-assessor`).
- [x] Homologação final com o usuário.

## [x] Fase 6: Portal do Condômino e Integração Social
- [x] **Novo Sistema de Login (Moradores):** Acesso utilizando apenas "Unidade" e "Senha".
- [x] **Fluxo de Primeiro Acesso:** Definição de senha padrão inicial para todos.
- [x] **Área do Condômino:** Dashboard exclusivo do morador.
- [x] **Gestão Inteligente de Encomendas:** Zelador cadastra pacote marcando a unidade; morador visualiza na sua área.

## [x] Fase 7: Empreendedores e Vitrine
- [x] **Área de Empreendedores:** Morador pode cadastrar seus serviços profissionais, indo para a vitrine de serviços.
- [x] **Vitrine Pública:** Área na página principal exibindo os últimos profissionais cadastrados.

## [x] Fase 8: Classificados
- [x] **Classificados Internos:** Morador publica itens para venda/doação, exibidos na home do sistema.

## [x] Fase 9: Módulo de Estoque e Refinamentos
- [x] **Banco de Dados:** Criação das tabelas `estoque_itens`, `estoque_movimentacoes` e funções de integração.
- [x] **Gestão de Inventário:** Tela de listagem, cadastro e movimentação de estoque (`AdminEstoque`).
- [x] **Integração Manutenção:** Ao registrar manutenção, deduz estoque de materiais utilizados via RPC.
- [x] **Interface Clean:** Ocultação do menu antigo da `Home.jsx` centralizando as atenções e movendo acessos para área restrita no rodapé.
- [x] **Centralização Logo:** O logo na Home foi centralizado para se adequar ao novo header sem links.
- [x] **Paginação de Limpeza:** Adicionado sistema de paginação para o relatório e histórico de limpezas (`/limpeza`).

## [x] Fase 10: Auditoria e Mitigação de Segurança (AppSec)
*Baseado no plano de ação: `relatorio_auditoria_projeto.md`*
- [x] **Correção de RLS (Vazamento de Dados):** Remover políticas `USING (true)` de tabelas sensíveis como `locais` (que expõe senhas) e `perfis` (que expõe e-mails públicos).
- [x] **Correção BOLA/IDOR (Classificados):** Refatorar `morador_alterar_status_classificado` e `morador_excluir_classificado` para validarem segurança através de `auth.uid()` em vez do parâmetro de frontend.
- [x] **Escalada de Privilégios (Estoque):** Adicionar barreira de autorização em `registrar_manutencao_com_estoque` para validar o perfil `ADM` ou `GESTOR`.
- [x] **Storage Seguros:** Implementar restrição de extensão e validação de tipos MIME no RLS dos Buckets (Uploads).

## [x] Fase 11: Refatoração Orientada a Serviços (Data Layer)
*Baseado no plano de ação: `relatorio_auditoria_projeto.md`*
- [x] **Abstração de Banco de Dados:** Eliminar `Query Sprawl` centralizando `supabase.from()` dentro de novos Hooks em `src/hooks/`.
- [x] **Redução de Dívida Técnica:** Modularizar os componentes gigantes (`AdminMaintenance.jsx`, `Home.jsx`, `AdminParking.jsx`, `AdminPoolCleaning.jsx`) extraindo modais e tabelas para `src/components/`.

## [x] Fase 12: Unificação de Design System e Animações GSAP
*Baseado no plano de ação: `relatorio_auditoria_projeto.md`*
- [x] **Restauração de Paleta UI:** Ajustar `tailwind.config.js` mantendo a paleta oficial (Laranja Permanente) e removendo resquícios de Azul/Amber.
- [x] **Motor de Animações:** Instalar pacotes obrigatórios `@gsap/react` e implementar transições fluidas nas modais e páginas.
