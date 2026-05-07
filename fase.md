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
- [x] Reversão da paleta Navy & Amber para o **Azul, Esmeralda e Branco original**.
- [x] Restauro completo da `Home.jsx`, `Dashboard.jsx`, `PoolPasses.jsx` e `Login.jsx`.
- [x] Padronização de Sombras Confortáveis (`shadow-sm`) e Arredondamentos `3xl`.
- [x] Limpeza de resquícios de tipografia `font-black` e cores experimentais.
- [x] Verificação de contraste e legibilidade em todos os módulos.
- [x] Refinamento dos Módulos de **Pulseiras** e **Vôlei** (Design Clássico).
- [x] Portal de Login azul original restabelecido.
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
- [x] Implementação do Módulo de **Empreendedores** (Divulgação de serviços).

## [/] Fase 5: Ajustes de Manutenção e Estabilidade (Em Progresso)
- [x] Correção do Histórico de Manutenção (Bug de Join inexistente).
- [ ] Verificação de integridade dos registros do Zelador.
- [ ] Ajuste final das cores no `tailwind.config.js` para garantir o azul original.
- [ ] Testes de maturidade de código (`code-maturity-assessor`).
- [ ] Homologação final com o usuário.
