/**
 * Utilitário para lidar com datas sem problemas de fuso horário (UTC vs Local).
 * Quando o Supabase retorna "2024-03-21", o JavaScript tende a converter para UTC,
 * o que no Brasil (UTC-3) vira "2024-03-20 21:00".
 */

/**
 * Converte uma string "YYYY-MM-DD" para um objeto Date no fuso horário LOCAL.
 * @param {string} dateStr 
 * @returns {Date}
 */
export function parseDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formata uma string "YYYY-MM-DD" para o padrão brasileiro "DD/MM/YYYY".
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
}

/**
 * Retorna o dia do mês de uma string "YYYY-MM-DD".
 * @param {string} dateStr 
 * @returns {number}
 */
export function getDayOfMonth(dateStr) {
    const date = parseDate(dateStr);
    return date ? date.getDate() : '';
}

/**
 * Retorna o mês abreviado ou completo.
 * @param {string} dateStr 
 * @param {string} format 'short' ou 'long'
 * @returns {string}
 */
export function getMonthName(dateStr, format = 'short') {
    const date = parseDate(dateStr);
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', { month: format });
}
