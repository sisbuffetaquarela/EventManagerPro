import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';
import logoUrl from '../components/logo.png';

// Helper para carregar a imagem da logo
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export const generateBudgetPDF = async (budget: Budget) => {
  const doc = new jsPDF();

  // Configuração de Cores
  const colorPrimary = [79, 70, 229]; // Indigo (Barra lateral)
  const colorMenu = [15, 23, 42];     // Slate 900 (Fundo da Logo - Cor do Menu)
  const colorDark = [40, 40, 40];     
  const colorLight = [100, 100, 100]; 

  // --- BARRA LATERAL ESQUERDA ---
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(0, 0, 8, 297, 'F'); 

  // --- TÍTULO ---
  doc.setFontSize(24);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO DE EVENTO', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 32);

  // --- LOGO E FUNDO (Superior Direito) ---
  try {
    // Desenha o fundo da cor do menu (Slate 900) no canto superior direito
    // Posição X: 150 (largura A4 é 210, então ocupa os 60mm finais)
    const bgX = 150;
    const bgY = 0;
    const bgWidth = 60;
    const bgHeight = 40;

    doc.setFillColor(colorMenu[0], colorMenu[1], colorMenu[2]);
    doc.rect(bgX, bgY, bgWidth, bgHeight, 'F');

    // Carrega e desenha a logo
    const img = await loadImage(logoUrl);
    
    // Calcula dimensões para manter proporção, limitando a largura a 40mm
    const maxLogoWidth = 40;
    const maxLogoHeight = 25;
    let logoWidth = img.width;
    let logoHeight = img.height;
    
    const ratio = Math.min(maxLogoWidth / logoWidth, maxLogoHeight / logoHeight);
    logoWidth = logoWidth * ratio;
    logoHeight = logoHeight * ratio;

    // Centraliza a logo dentro do box escuro
    const logoX = bgX + (bgWidth - logoWidth) / 2;
    const logoY = bgY + (bgHeight - logoHeight) / 2;

    doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Não foi possível carregar a logo para o PDF', error);
  }

  // --- DADOS DO EVENTO ---
  let currentY = 55;
  const labelX = 20;
  const valueX = 60; 
  const lineHeight = 8;

  const drawInfoRow = (label: string, value: string | number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(label, labelX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(String(value), valueX, currentY);

    currentY += lineHeight;
  };

  drawInfoRow('Cliente:', budget.clientName);
  drawInfoRow('Festa:', budget.eventName);
  drawInfoRow('Telefone:', budget.clientPhone);
  drawInfoRow('Data do Evento:', formatDate(budget.eventDate));
  drawInfoRow('Convidados:', `${budget.guestCount || 0} pessoas`);

  // --- TABELA DE ITENS ---
  const tableStartY = currentY + 10;

  const tableBody = budget.items.map(item => [
    item.name,
    item.quantity
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['DESCRIÇÃO DO ITEM', 'QTD']],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 10,
      font: 'helvetica',
      cellPadding: 4,
      textColor: [50, 50, 50]
    },
    headStyles: {
      fillColor: colorPrimary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', cellWidth: 40 } 
    },
    
    // Configuração do Rodapé (Total)
    showFoot: 'lastPage', // IMPORTANTE: Exibe o rodapé apenas na última página
    foot: [['TOTAL GERAL', formatCurrency(budget.totalSales)]],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: colorDark,
      fontStyle: 'bold',
      halign: 'right', 
      fontSize: 12
    },
    margin: { left: 20, right: 14 }
  });

  // --- RODAPÉ FINAL DO DOCUMENTO ---
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(9);
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Validade da proposta: 15 dias.', 20, finalY + 15);
  doc.text('Agradecemos a preferência!', 20, finalY + 20);

  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};
