# Relatório Completo de Avaliação e Melhorias

Este relatório foi gerado com base na avaliação arquitetural e funcional do projeto MaxClubItaim-v2, cruzando o código-fonte atual com as regras de maturidade estritas contidas na pasta `/skills` (com foco especial na auditoria profunda orientada pelo `AuditorSec.md`).

## 🚨 DIAGNÓSTICO DE VULNERABILIDADES CRÍTICAS (APPSEC)

A auditoria baseada no `AuditorSec.md` revelou falhas graves de segurança (Severidade Alta/Crítica) que expõem o sistema a vazamento de dados, escalada de privilégios e IDOR. 

### 1. Vazamento de Dados Sensíveis e Senhas (Regra 8 - AuditorSec)
- **Vulnerabilidade:** A tabela `locais` possui a coluna `senha_atual` (senhas de acesso em texto plano). Contudo, a política RLS atual em `schema.sql` (linha 158) é: `CREATE POLICY "Leitura pública de locais" ON locais FOR SELECT USING (true);`.
- **Impacto:** **CRÍTICO**. Qualquer pessoa com a chave pública do Supabase pode consultar todas as senhas do condomínio via API. O mesmo ocorre para a tabela `perfis`, expondo emails e nomes de todos os moradores publicamente.
- **Correção:** Remover o `USING (true)` para tabelas sensíveis. Expor apenas os campos necessários através de *Views* seguras ou bloquear o acesso não autenticado (`auth.role() = 'authenticated'`).

### 2. IDOR / BOLA em Classificados (Regra 4 - AuditorSec)
- **Vulnerabilidade:** As RPCs `morador_alterar_status_classificado` e `morador_excluir_classificado` operam como `SECURITY DEFINER`. Elas confiam no parâmetro `p_unidade` enviado pelo Frontend para permitir a exclusão do anúncio, sem cruzar com a verdadeira identidade do usuário logado.
- **Impacto:** **ALTO**. Um usuário mal-intencionado pode enviar uma requisição forjada passando a unidade de um vizinho e deletar/alterar os anúncios de terceiros.
- **Correção:** Substituir o uso de `p_unidade` pela verificação direta do perfil do usuário logado via `auth.uid()`.

### 3. Escalada de Privilégios em Estoque (Regra 5 - AuditorSec)
- **Vulnerabilidade:** A função `registrar_manutencao_com_estoque` (`fase9_estoque.sql`) realiza movimentações financeiras/materiais (deduz do estoque) operando como `SECURITY DEFINER`. Contudo, não há nenhuma verificação interna na função para checar se quem invocou a RPC é, de fato, um `ADM` ou `GESTOR`.
- **Impacto:** **ALTO**. Qualquer usuário logado pode invocar a função para subtrair itens do estoque, ignorando a trava imposta pelo RLS da tabela `estoque_itens`.
- **Correção:** Inserir validação `IF NOT EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('GESTOR', 'ADM')) THEN RAISE EXCEPTION ...` dentro da função.

### 4. Upload de Arquivos Sem Validação (Regra 7 - AuditorSec)
- **Vulnerabilidade:** As políticas de Storage (ex: bucket `classificados`, `manutencao`) possuem permissão de leitura pública, mas não restringem os tipos MIME no momento do INSERT. O frontend comprime imagens, mas a API não bloqueia requisições forjadas com executáveis ou SVGs maliciosos.
- **Impacto:** **MÉDIO/ALTO**. Risco de distribuição de malware e XSS através de Storage estático.
- **Correção:** Adicionar verificações explícitas no RLS do `storage.objects` validando `bucket_id` e restringindo as extensões permitidas e os tipos MIME.

### 5. Configuração Insegura em Produção (Regra 22 - AuditorSec)
- **Vulnerabilidade:** O `schema.sql` (linha 146) declara expressamente: `-- Configurações de RLS (Row Level Security) - Simplificado para desenvolvimento`. Manter essa estrutura baseada em `USING (true)` vai de encontro direto às diretrizes do `01-baas-security-constitution.md`.

---

## 🏗 DIAGNÓSTICO ARQUITETURAL E UI

Além das falhas de segurança imediatas, o sistema viola as regras de Arquitetura Limpa e Maturidade UI:

### 1. Dívida Técnica e Complexidade (`05-lean-refactor-specialist.md`)
- **Componentes Gigantes:** `AdminMaintenance.jsx` (609L), `Home.jsx` (603L) e `AdminParking.jsx` (550L) são monolitos de visualização.
- **Acoplamento de Dados (Query Sprawl):** O acesso `supabase.from()` está espalhado sem controle (8 ocorrências apenas no `AdminParking.jsx`), sem abstração de `Hooks` ou `Services`.

### 2. Inconsistência do Sistema de UI (`fase.md` e `_5ui-design-system`)
- **Paleta Defasada:** O `tailwind.config.js` usa `Amber-500` / `Slate-800` (Navy), contradizendo o restauro obrigatório para a paleta "Laranja (Cor Oficial Permanente)" da Fase 3.

### 3. Animações e Comportamento (`_1gsap-skills-main`)
- O GSAP (`@gsap/react`), exigido para a experiência premium de interface, não está instalado, invalidando toda a diretriz de layout.

---

## 🛠 PLANO DE AÇÃO ESTRATÉGICA (Fases de Execução)

Para que o código consiga aprovação definitiva no **Code Maturity Assessor**, proponho as seguintes fases de correção:

### 🔴 FASE 1: Mitigação Crítica (AppSec - Imediato)
1. **Blindagem do Banco:** Corrigir as políticas RLS `USING(true)` que expõem senhas (`locais`) e perfis.
2. **Correção das RPCs (BOLA):** Atualizar `morador_alterar_status_classificado`, `morador_excluir_classificado` e `registrar_manutencao_com_estoque` para validarem o `auth.uid()` internamente e barrarem manipulação direta de IDs e unidades.

### 🟡 FASE 2: Arquitetura Orientada a Serviços (Data Layer)
1. Extrair chamadas diretas ao Supabase dos componentes (Query Sprawl) para hooks padronizados na pasta `src/hooks/`.
2. Refatorar os componentes gigantes (acima de 500 linhas) aplicando extração de componentes menores (`src/components/`).

### 🔵 FASE 3: Unificação UI e Instalação de GSAP (Design Layer)
1. Limpar as cores experimentais do `tailwind.config.js` adequando 100% aos tons originais de Fase 3.
2. Instalar bibliotecas GSAP e implementar as micro-interações exigidas pelo Design System.

---

**NOTA AO DESENVOLVEDOR:**
Nenhuma nova funcionalidade ou tabela deve ser implementada antes do fechamento da **Fase 1** (Mitigação Crítica), devido aos riscos confirmados de vazamento de credenciais via RLS fraco.
