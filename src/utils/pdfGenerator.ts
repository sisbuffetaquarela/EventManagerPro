import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from '../types';
import { formatCurrency, formatDate } from './format';
import logoUrl from '../components/logo.png';

// 1. Helper robusto para converter imagem em Base64 (Corrige o erro da logo)
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

  // Configuração de Cores
  const colorPrimary = [79, 70, 229]; // Indigo
  const colorMenu = [15, 23, 42];     // Slate 900
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
    const bgX = 150;
    const bgY = 0;
    const bgWidth = 60;
    const bgHeight = 40;

    // Fundo escuro
    doc.setFillColor(colorMenu[0], colorMenu[1], colorMenu[2]);
    doc.rect(bgX, bgY, bgWidth, bgHeight, 'F');

    // Carrega a imagem como Base64
    const base64Img = await getBase64FromUrl(logoUrl);
    
    // Define dimensões fixas ou proporcionais para a logo
    const logoWidth = 35; // Largura fixa desejada
    const logoHeight = 20; // Altura fixa desejada (ajuste conforme a proporção real da sua imagem)

    // Centraliza matematicamente
    const logoX = bgX + (bgWidth - logoWidth) / 2;
    const logoY = bgY + (bgHeight - logoHeight) / 2;

    doc.addImage(base64Img, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Erro ao carregar logo:', error);
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

  // --- TABELA DE ITENS (Sem Rodapé Aqui) ---
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
    margin: { left: 20, right: 14 }
  });

  // --- TABELA DE TOTAL (Separada para garantir apenas no final) ---
  // Pegamos a posição Y onde a tabela anterior terminou
  const finalYAfterTable = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalYAfterTable + 2, // Um pequeno espaço após a tabela de itens
    body: [
        ['TOTAL GERAL', formatCurrency(budget.totalSales)]
    ],
    // Removemos o cabeçalho desta tabela
    showHead: 'never',
    theme: 'plain', // Sem grades, para parecer um rodapé
    styles: {
        font: 'helvetica',
        fontStyle: 'bold',
        fontSize: 12,
        textColor: colorDark,
        halign: 'right', // Alinha tudo à direita
        cellPadding: 4,
        fillColor: [245, 245, 245] // Fundo cinza suave
    },
    columnStyles: {
        0: { cellWidth: 'auto' }, // Ocupa o espaço necessário
        1: { cellWidth: 40 }      // Mesma largura da coluna de QTD/Valor anterior
    },
    margin: { left: 20, right: 14 }
  });

  // --- RODAPÉ DE TEXTO ---
  // Atualizamos o finalY baseando-se na tabela de totais agora
  const finalPageY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(9);
  doc.setTextColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Validade da proposta: 15 dias.', 20, finalPageY);
  doc.text('Agradecemos a preferência!', 20, finalPageY + 5);

  doc.save(`Orcamento_${budget.clientName.replace(/\s/g, '_')}_${budget.eventDate}.pdf`);
};