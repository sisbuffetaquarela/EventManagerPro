import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';
import logoUrl from '../components/logo.png';

// Mantemos o Helper de Base64 que funcionou bem
const getBase64FromUrl = async (url: string): Promise<string> => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data as string);
    };
  });
};

export const generateBudgetPDF = async (budget: Budget) => {
  const doc = new jsPDF();

  // --- PALETA DE CORES MODERNA ---
  // Slate 900 (Fundo do Header/Menu)
  const colorHeaderBg = [15, 23, 42]; 
  // Indigo 600 (Destaques e Cabeçalho da Tabela)
  const colorAccent = [79, 70, 229]; 
  // Cinza Escuro (Textos Principais)
  const colorTextDark = [51, 65, 85]; 
  // Cinza Médio (Textos Secundários/Labels)
  const colorTextLight = [100, 116, 139]; 
  // Branco
  const colorWhite = [255, 255, 255];

  // --- CABEÇALHO (BANNER SUPERIOR) ---
  // Retângulo cobrindo toda a largura superior (0 a 210mm)
  doc.setFillColor(colorHeaderBg[0], colorHeaderBg[1], colorHeaderBg[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Título (Branco sobre fundo escuro)
  doc.setFontSize(22);
  doc.setTextColor(colorWhite[0], colorWhite[1], colorWhite[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', 14, 20); // Margem esquerda padrão é 14mm no jspdf

  // Subtítulo / Data (Cinza claro ou Branco com transparência visual)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

  // --- LOGO (Alinhada à Direita dentro do Banner) ---
  try {
    const base64Img = await getBase64FromUrl(logoUrl);
    
    // Dimensões máximas para a logo
    const maxW = 45;
    const maxH = 25;
    
    // Pegamos as dimensões originais da imagem (hack para jsPDF pegar ratio)
    const imgProps = doc.getImageProperties(base64Img);
    const ratio = imgProps.width / imgProps.height;
    
    let renderW = maxW;
    let renderH = maxW / ratio;

    if (renderH > maxH) {
      renderH = maxH;
      renderW = maxH * ratio;
    }

    // Posição: 210 (largura A4) - 14 (margem) - largura da logo
    const logoX = 210 - 14 - renderW;
    const logoY = (40 - renderH) / 2; // Centraliza verticalmente no banner de 40 de altura

    doc.addImage(base64Img, 'PNG', logoX, logoY, renderW, renderH);
  } catch (error) {
    console.warn('Logo não carregada:', error);
  }

  // --- DADOS DO CLIENTE (Layout em Grid Clean) ---
  let startY = 55;
  
  // Função auxiliar para desenhar campos com Label (cinza) e Valor (escuro)
  const drawField = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorTextLight[0], colorTextLight[1], colorTextLight[2]);
    doc.text(label.toUpperCase(), x, y);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    doc.text(String(value), x, y + 6);
  };

  // Coluna 1
  drawField('Cliente', budget.clientName, 14, startY);
  drawField('Telefone', budget.clientPhone, 14, startY + 14);

  // Coluna 2 (Deslocada 80mm para direita)
  drawField('Evento', budget.eventName, 100, startY);
  drawField('Data Prevista', formatDate(budget.eventDate), 100, startY + 14);

  // Coluna 3 (Canto direito)
  drawField('Convidados', `${budget.guestCount || 0} Pessoas`, 160, startY);


  // --- TABELA DE ITENS (Modernizada) ---
  const tableStartY = startY + 25;

  const tableBody = budget.items.map(item => [
    item.name,
    item.quantity
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['DESCRIÇÃO DO SERVIÇO / PRODUTO', 'QTD']],
    body: tableBody,
    theme: 'striped', // Visual listrado é mais moderno que 'grid'
    styles: {
      fontSize: 10,
      font: 'helvetica',
      cellPadding: 6, // Mais espaçamento interno (respiro)
      textColor: colorTextDark,
      lineColor: [241, 245, 249], // Bordas muito sutis
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: colorAccent, // Indigo no cabeçalho da tabela
      textColor: colorWhite,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 8 // Cabeçalho um pouco maior
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', cellWidth: 30 } 
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Cinza muito claro (Slate 50) nas linhas pares
    },
    margin: { left: 14, right: 14 }
  });

  // --- TABELA DE TOTAIS (Minimalista) ---
  const finalYAfterTable = (doc as any).lastAutoTable.finalY;

  // Linha separadora sutil antes do total
  doc.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  doc.setLineWidth(0.5);
  doc.line(14, finalYAfterTable + 2, 196, finalYAfterTable + 2);

  autoTable(doc, {
    startY: finalYAfterTable + 4,
    body: [
        ['VALOR TOTAL', formatCurrency(budget.totalSales)]
    ],
    showHead: 'never',
    theme: 'plain',
    styles: {
        font: 'helvetica',
        fontStyle: 'bold',
        fontSize: 14, // Fonte maior para o total
        textColor: colorAccent, // Total na cor de destaque (Indigo)
        halign: 'right',
        cellPadding: 6
    },
    columnStyles: {
        0: { cellWidth: 'auto' }, 
        1: { cellWidth: 50 } 
    },
    margin: { left: 14, right: 14 }
  });

  // --- RODAPÉ ---
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setTextColor(colorTextLight[0], colorTextLight[1], colorTextLight[2]);
  doc.text('Proposta válida por 15 dias.', 14, pageHeight - 15);
  doc.text('Este documento não vale como recibo de pagamento.', 14, pageHeight - 11);
  
  // Numeração de páginas (Opcional, mas profissional)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, 196, pageHeight - 11, { align: 'right' });
  }

  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};