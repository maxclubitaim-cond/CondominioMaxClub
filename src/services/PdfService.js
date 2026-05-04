import { jsPDF } from "jspdf";
import { formatDate as safeFormatDate } from "../utils/dateUtils";

/**
 * PdfService
 * Centraliza a lógica de geração de relatórios PDF com o design Navy Premium do MaxClub.
 */
export const PdfService = {
  /**
   * Gera um relatório em PDF para o módulo especificado
   * @param {string} moduleName Nome do módulo (Limpeza, Piscina, etc)
   * @param {Array} data Lista de registros para exportar
   * @param {Object} range Objeto com { start, end }
   */
  async generateModuleReport(moduleName, data, range) {
    const doc = new jsPDF();
    const primaryColor = "#10B981"; // Emerald
    const navyColor = "#0F172A";    // Slate 900 (Navy)

    // --- CABEÇALHO ---
    doc.setFillColor(navyColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MAXCLUB ITAIM", 20, 20);
    
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(10);
    doc.text(`RELATÓRIO: ${moduleName.toUpperCase()} - CONTROLE CORPORATIVO`, 20, 30);
    
    // --- PERÍODO ---
    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    const startStr = formatDate(range.start);
    const endStr = formatDate(range.end);

    doc.setTextColor("#FFFFFF");
    doc.setFontSize(8);
    doc.text(`PERÍODO: ${startStr} A ${endStr}`, 150, 30);

    // --- TABELA ---
    let yPos = 55;
    doc.setTextColor(navyColor);
    doc.setFontSize(12);
    doc.text(`Registros Encontrados: ${data.length}`, 20, yPos);
    
    yPos += 10;
    doc.setFillColor("#F8FAFC");
    doc.rect(20, yPos, 170, 8, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(navyColor);
    doc.text("Unidade / Local", 25, yPos + 5);
    doc.text("Data Registro", 80, yPos + 5);
    doc.text("Status / Detalhe", 130, yPos + 5);
    
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    data.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const dateStr = item.created_at || item.data_uso || item.data || new Date().toISOString();
      const formattedDate = safeFormatDate(dateStr);
      
      doc.text(String(item.unidade || item.local || "N/A"), 25, yPos);
      doc.text(formattedDate, 80, yPos);
      doc.text(String(item.status || item.quantidade || "REGISTRADO"), 130, yPos);
      
      yPos += 8;
      doc.setDrawColor("#F1F5F9");
      doc.line(20, yPos - 2, 190, yPos - 2);
      yPos += 2;
    });

    // --- RODAPÉ ---
    doc.setTextColor("#CBD5E1");
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
    doc.text("MaxClub Itaim Control Center - Documento Confidencial", 130, 285);

    // Salvar
    const filename = `relatorio-${moduleName.toLowerCase()}-${range.start}.pdf`;
    doc.save(filename);
    return true;
  }
};
