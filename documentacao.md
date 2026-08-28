# Documentação do MaxClubItaim-v2

Este arquivo consolida as regras de negócio e documentação técnica dos módulos implementados no sistema.

## Módulo: Ronda Predial
Permite que usuários com perfil de `OPERADOR`, `GESTOR` ou `ADM` realizem rondas nas áreas comuns do condomínio.

### Regras de Negócio:
1. **Pontos de Ronda:** Os pontos a serem inspecionados são listados a partir da tabela `locais_ronda` com `ativo = true`, ordenados pela coluna `ordem`.
2. **Registro Positivo:** O operador marca o local como "OK", indicando conformidade. Nenhuma ação adicional é obrigatória.
3. **Registro Negativo (Inconformidade):** O operador marca o local como "Problema". Neste caso, o sistema permite a inserção de um **Relato (Texto)** e o upload de uma **Foto (Evidência)**.
4. **Histórico:** Os gestores e operadores podem visualizar o histórico recente das checagens.
5. **Auditoria:** Todo registro salva automaticamente o `operador_id` (quem fez a checagem) e a data/hora exata (`created_at`).
