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
    
    // Se já for um objeto Date, retorna ele mesmo
    if (dateStr instanceof Date) return dateStr;

    // Se for uma string ISO completa (ex: 2024-03-21T00:00:00Z), pega apenas a parte da data
    const cleanDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr;
    
    // Suporta tanto YYYY-MM-DD quanto YYYY/MM/DD
    const parts = String(cleanDate).split(/[-/]/).map(Number);
    
    if (parts.length < 3) return null;
    
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    
    // Verifica se a data é válida
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Formata uma data para string (DD/MM/YYYY)
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
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

/**
 * Formata o horário de um timestamp ISO ou string de hora.
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        // Se for apenas uma string de hora "HH:mm:ss"
        return dateStr.slice(0, 5);
    }
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata data e hora juntas de forma segura.
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return formatDate(dateStr);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Formata uma data como "DD de MMMM".
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateLong(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date);
}
