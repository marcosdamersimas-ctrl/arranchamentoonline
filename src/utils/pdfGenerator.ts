import { jsPDF } from 'jspdf';
import { FirebaseUser, ArranchamentoRecord } from '../types';

export function generateMapaDaForcaPDF(
  users: FirebaseUser[],
  meals: ArranchamentoRecord[],
  dateStr: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalUsers = users.length;

  // Outer border - Vinho Color Theme
  doc.setDrawColor(122, 12, 12); // Vinho
  doc.setLineWidth(0.6);
  doc.rect(5, 5, 200, 287);

  // Inner border
  doc.setDrawColor(201, 162, 39); // Ouro
  doc.setLineWidth(0.25);
  doc.rect(6.2, 6.2, 197.6, 284.6);

  // Header
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MINISTÉRIO DA DEFESA', 105, 15, { align: 'center' });
  doc.text('EXÉRCITO BRASILEIRO', 105, 20, { align: 'center' });
  doc.text('7º REGIMENTO DE CAVALARIA MECANIZADO', 105, 25, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('REGIMENTO DA FRONTEIRA - ARRANCHA+', 105, 30, { align: 'center' });
  
  doc.setDrawColor(122, 12, 12);
  doc.setLineWidth(0.5);
  doc.line(15, 33, 195, 33);

  // Title
  doc.setTextColor(122, 12, 12); // Vinho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MAPA DA FORÇA', 105, 42, { align: 'center' });

  // Date and Metadata
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Data de Referência: ${dateStr.split('-').reverse().join('/')}`, 15, 50);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 130, 50);

  // Summary Table Header (Vinho-light tint background)
  doc.setFillColor(250, 240, 240);
  doc.rect(15, 54, 180, 13, 'F');
  doc.setDrawColor(122, 12, 12);
  doc.setLineWidth(0.3);
  doc.rect(15, 54, 180, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(122, 12, 12);
  doc.text('RESUMO DE EFETIVO', 20, 62.5);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`Militares Cadastrados: ${totalUsers}`, 130, 62.5);

  // Section Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(122, 12, 12);
  doc.text('RELAÇÃO DE MILITARES CADASTRADOS', 15, 78);

  // Table header
  const tableTop = 82;
  doc.setFillColor(122, 12, 12); // Vinho
  doc.rect(15, tableTop, 180, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Nome de Guerra', 18, tableTop + 5);
  doc.text('Esquadrão / Repartição', 95, tableTop + 5);
  doc.text('Nível de Acesso', 160, tableTop + 5);

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  let y = tableTop + 7;
  const rowHeight = 6.2;

  users.forEach((u, index) => {
    // Check page overflow
    if (y > 255) {
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('Arrancha+ (7º RC Mec) - Mapa da Força', 15, 281);
      doc.text(`Página de continuação`, 180, 281);
      
      doc.addPage();
      
      // Draw border again on page 2
      doc.setDrawColor(122, 12, 12);
      doc.setLineWidth(0.6);
      doc.rect(5, 5, 200, 287);
      doc.setDrawColor(201, 162, 39);
      doc.setLineWidth(0.25);
      doc.rect(6.2, 6.2, 197.6, 284.6);

      // Repeat Table Header
      y = 15;
      doc.setFillColor(122, 12, 12);
      doc.rect(15, y, 180, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Nome de Guerra', 18, y + 5);
      doc.text('Esquadrão / Repartição', 95, y + 5);
      doc.text('Nível de Acesso', 160, y + 5);

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      y += 7;
    }

    // Alternating background colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(15, y, 180, rowHeight, 'F');
    }

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.rect(15, y, 180, rowHeight);

    // User Text
    doc.setFont('helvetica', 'bold');
    doc.text(u.usuario, 18, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(u.reparticao, 95, y + 4.2);
    doc.text(u.nivel, 160, y + 4.2);

    doc.setTextColor(30, 30, 30);
    y += rowHeight;
  });

  // Bottom text
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Documento oficial do 7º Regimento de Cavalaria Mecanizado - Arrancha+', 105, 281, { align: 'center' });

  doc.save(`mapa_da_forca_${dateStr}.pdf`);
}

export function generateArranchamentoPDF(
  users: FirebaseUser[],
  meals: ArranchamentoRecord[],
  dateStr: string,
  selectedReparticao: string = 'Todas'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formattedDate = dateStr.split('-').reverse().join('/');

  // Filter meals for the selected date and, if specified, for the selected department
  const filteredMeals = meals.filter(m => {
    if (m.dataRegistro !== dateStr) return false;
    if (!m.cafe && !m.almoco && !m.jantar) return false;

    if (selectedReparticao !== 'Todas') {
      const userObj = users.find(u => u.usuario.toLowerCase() === m.usuario.toLowerCase());
      const rep = userObj?.reparticao || m.reparticao || 'Esqd Cap';
      return rep.toLowerCase().trim() === selectedReparticao.toLowerCase().trim();
    }
    return true;
  });

  // Grouping structure
  interface GroupedMilitary {
    usuario: string;
    cafe: boolean;
    almoco: boolean;
    jantar: boolean;
    reparticaoOriginal: string;
  }

  const groupBuckets: { [key: string]: GroupedMilitary[] } = {
    'Oficiais': [],
    'St/Sgt': [],
    '1º Esqd': [],
    '2º Esqd': [],
    '3º Esqd': [],
    'Esqd Cap': [],
    'Fanfarra': []
  };

  filteredMeals.forEach(m => {
    const userObj = users.find(u => u.usuario.toLowerCase() === m.usuario.toLowerCase());
    const rep = userObj?.reparticao || m.reparticao || 'Esqd Cap';
    
    // Find the closest bucket or default to 'Esqd Cap'
    let targetBucket = 'Esqd Cap';
    if (groupBuckets[rep]) {
      targetBucket = rep;
    } else {
      // Find case-insensitive match or match partial words
      const foundBucketKey = Object.keys(groupBuckets).find(k => k.toLowerCase() === rep.toLowerCase());
      if (foundBucketKey) {
        targetBucket = foundBucketKey;
      }
    }

    groupBuckets[targetBucket].push({
      usuario: m.usuario,
      reparticaoOriginal: rep,
      cafe: m.cafe,
      almoco: m.almoco,
      jantar: m.jantar
    });
  });

  let pageNum = 1;

  const drawPageSkeleton = () => {
    // Outer border - Vinho Color Theme
    doc.setDrawColor(122, 12, 12); // Vinho
    doc.setLineWidth(0.6);
    doc.rect(5, 5, 200, 287);

    // Inner border
    doc.setDrawColor(201, 162, 39); // Ouro
    doc.setLineWidth(0.25);
    doc.rect(6.2, 6.2, 197.6, 284.6);

    // Header
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('MINISTÉRIO DA DEFESA', 105, 14, { align: 'center' });
    doc.text('EXÉRCITO BRASILEIRO', 105, 18, { align: 'center' });
    doc.text('7º REGIMENTO DE CAVALARIA MECANIZADO', 105, 22, { align: 'center' });
    
    doc.setDrawColor(122, 12, 12);
    doc.setLineWidth(0.4);
    doc.line(15, 26, 195, 26);

    // Document Title
    doc.setTextColor(122, 12, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const titleText = selectedReparticao === 'Todas'
      ? `ARRANCHAMENTO DO DIA: ${formattedDate}`
      : `ARRANCHAMENTO: ${selectedReparticao.toUpperCase()} (${formattedDate})`;
    doc.text(titleText, 105, 35, { align: 'center' });

    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  |  ARRANCHA+`, 15, 41);
    doc.text(`Página ${pageNum}`, 185, 41);
  };

  drawPageSkeleton();

  let y = 45;
  const colX = {
    num: 15,
    name: 25,
    cafe: 115,
    almoco: 140,
    jantar: 165
  };

  const orderedGroups = selectedReparticao === 'Todas'
    ? ['Oficiais', 'St/Sgt', '1º Esqd', '2º Esqd', '3º Esqd', 'Esqd Cap', 'Fanfarra']
    : [selectedReparticao];

  orderedGroups.forEach(groupName => {
    const list = groupBuckets[groupName] || [];
    if (list.length === 0) return;

    // Check if we need a page break before drawing the group header
    if (y > 230) {
      doc.addPage();
      pageNum++;
      drawPageSkeleton();
      y = 45;
    }

    // Draw Group Header Box
    doc.setFillColor(122, 12, 12);
    doc.rect(15, y, 180, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    let headerText = groupName.toUpperCase();
    if (groupName === 'Oficiais') headerText += ' (TODOS OS OFICIAIS DO REGIMENTO)';
    if (groupName === 'St/Sgt') headerText += ' (TODOS OS SUBTENENTES E SARGENTOS)';
    if (['1º Esqd', '2º Esqd', '3º Esqd', 'Esqd Cap', 'Fanfarra'].includes(groupName)) {
      headerText += ' (CABOS E SOLDADOS)';
    }

    doc.text(headerText, 18, y + 4.5);
    y += 6.5;

    // Draw Table Header Row
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y, 180, 5.5, 'F');
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.rect(15, y, 180, 5.5);

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Nº', colX.num + 2, y + 4);
    doc.text('NOME DE GUERRA', colX.name + 3, y + 4);
    doc.text('CAFÉ', colX.cafe + 4, y + 4);
    doc.text('ALMOÇO', colX.almoco + 3, y + 4);
    doc.text('JANTAR', colX.jantar + 3, y + 4);
    
    y += 5.5;

    // List Members
    list.forEach((member, idx) => {
      // Check page overflow
      if (y > 245) {
        doc.addPage();
        pageNum++;
        drawPageSkeleton();
        y = 45;

        // Redraw Table Header row on new page for active group
        doc.setFillColor(122, 12, 12);
        doc.rect(15, y, 180, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`${groupName.toUpperCase()} (CONT.)`, 18, y + 4.2);
        y += 6;

        doc.setFillColor(245, 245, 245);
        doc.rect(15, y, 180, 5.5, 'F');
        doc.setDrawColor(210, 210, 210);
        doc.rect(15, y, 180, 5.5);
        doc.setTextColor(30, 30, 30);
        doc.text('Nº', colX.num + 2, y + 4);
        doc.text('NOME DE GUERRA', colX.name + 3, y + 4);
        doc.text('CAFÉ', colX.cafe + 4, y + 4);
        doc.text('ALMOÇO', colX.almoco + 3, y + 4);
        doc.text('JANTAR', colX.jantar + 3, y + 4);
        y += 5.5;
      }

      // Alternate row backgrounds
      if (idx % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(15, y, 180, 6, 'F');
      }

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.15);
      doc.rect(15, y, 180, 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);

      // Print number
      doc.text(String(idx + 1), colX.num + 3, y + 4.2);

      // Print war name
      doc.setFont('helvetica', 'bold');
      doc.text(member.usuario, colX.name + 3, y + 4.2);
      doc.setFont('helvetica', 'normal');

      // Café Check
      if (member.cafe) {
        doc.setTextColor(34, 139, 34);
        doc.setFont('helvetica', 'bold');
        doc.text('SIM', colX.cafe + 4, y + 4.2);
      } else {
        doc.setTextColor(180, 180, 180);
        doc.text('—', colX.cafe + 6, y + 4.2);
      }

      // Almoço Check
      if (member.almoco) {
        doc.setTextColor(34, 139, 34);
        doc.setFont('helvetica', 'bold');
        doc.text('SIM', colX.almoco + 5, y + 4.2);
      } else {
        doc.setTextColor(180, 180, 180);
        doc.text('—', colX.almoco + 7, y + 4.2);
      }

      // Jantar Check
      if (member.jantar) {
        doc.setTextColor(34, 139, 34);
        doc.setFont('helvetica', 'bold');
        doc.text('SIM', colX.jantar + 5, y + 4.2);
      } else {
        doc.setTextColor(180, 180, 180);
        doc.text('—', colX.jantar + 7, y + 4.2);
      }

      y += 6;
    });

    y += 5; // spacing after group
  });

  // Final total counts and signature lines
  if (y > 205) {
    doc.addPage();
    pageNum++;
    drawPageSkeleton();
    y = 45;
  }

  // Footer / Total statistics block
  doc.setFillColor(250, 240, 240);
  doc.rect(15, y, 180, 15, 'F');
  doc.setDrawColor(122, 12, 12);
  doc.setLineWidth(0.3);
  doc.rect(15, y, 180, 15);

  const totalCafe = filteredMeals.filter(m => m.cafe).length;
  const totalAlmoco = filteredMeals.filter(m => m.almoco).length;
  const totalJantar = filteredMeals.filter(m => m.jantar).length;
  
  doc.setTextColor(122, 12, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('QUANTITATIVO TOTAL DE ETAPAS DESTE ARRANCHAMENTO:', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`CAFÉ DA MANHÃ: ${totalCafe}   |   ALMOÇO: ${totalAlmoco}   |   JANTAR: ${totalJantar}`, 18, y + 10);

  y += 32;

  // Format full date in Portuguese
  const getFormattedLocationDate = (dStr: string) => {
    try {
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const [year, month, day] = dStr.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      const dayNum = parseInt(day, 10);
      return `Santana do Livramento, RS, ${dayNum} de ${months[monthIndex]} de ${year || '2026'}.`;
    } catch (e) {
      return `Santana do Livramento, RS, ${dStr}`;
    }
  };

  // Location and Date (spaced 10 units below the statistics box bottom, which is y - 17)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(getFormattedLocationDate(dateStr), 105, y - 10, { align: 'center' });

  // Signatures
  doc.setLineWidth(0.35);
  doc.setDrawColor(122, 12, 12);
  doc.line(25, y, 90, y);
  doc.line(120, y, 185, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FURRIEL', 57, y + 4, { align: 'center' });
  doc.text('CMT DE ESQUADRÃO', 152, y + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Assinatura / Carimbo', 57, y + 8, { align: 'center' });
  doc.text('Assinatura / Carimbo', 152, y + 8, { align: 'center' });

  // Bottom text footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(getFormattedLocationDate(dateStr) + ' - Documento oficial - Arrancha+', 105, 281, { align: 'center' });

  // Generate the second page containing the "Vale Diário"
  doc.addPage();
  drawValeDiarioPage(doc, users, meals, dateStr, selectedReparticao);

  // Save the PDF
  doc.save(`arranchamento_${dateStr}.pdf`);
}

function drawValeDiarioPage(
  doc: jsPDF,
  users: FirebaseUser[],
  meals: ArranchamentoRecord[],
  dateStr: string,
  selectedReparticao: string = 'Todas'
) {
  const formattedDate = dateStr.split('-').reverse().join('/');

  // Get previous day formatted date
  const getPreviousDayDateStr = (dStr: string) => {
    try {
      const date = new Date(dStr + 'T12:00:00');
      date.setDate(date.getDate() - 1);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  };
  const previousDayFormatted = getPreviousDayDateStr(dateStr);

  const dateMeals = meals.filter(m => m.dataRegistro === dateStr);

  // Filter logic based on selectedReparticao
  const countMealsForGroup = (groupName: 'Oficiais' | 'St/Sgt' | 'CbSd', mealKey: 'cafe' | 'almoco' | 'jantar') => {
    return dateMeals.filter(m => {
      if (!m[mealKey]) return false;
      const userObj = users.find(u => u.usuario.toLowerCase() === m.usuario.toLowerCase());
      const rep = userObj?.reparticao || m.reparticao || 'Esqd Cap';

      // If a specific department is selected, we filter out users not in that department
      if (selectedReparticao !== 'Todas') {
        if (rep.toLowerCase().trim() !== selectedReparticao.toLowerCase().trim()) return false;
      }

      if (groupName === 'Oficiais') {
        return rep === 'Oficiais';
      } else if (groupName === 'St/Sgt') {
        return rep === 'St/Sgt';
      } else { // CbSd
        return ['1º Esqd', '2º Esqd', '3º Esqd', 'Esqd Cap', 'Fanfarra'].includes(rep);
      }
    }).length;
  };

  const countUniqueForGroup = (groupName: 'Oficiais' | 'St/Sgt' | 'CbSd') => {
    return dateMeals.filter(m => {
      if (!m.cafe && !m.almoco && !m.jantar) return false;
      const userObj = users.find(u => u.usuario.toLowerCase() === m.usuario.toLowerCase());
      const rep = userObj?.reparticao || m.reparticao || 'Esqd Cap';

      if (selectedReparticao !== 'Todas') {
        if (rep.toLowerCase().trim() !== selectedReparticao.toLowerCase().trim()) return false;
      }

      if (groupName === 'Oficiais') {
        return rep === 'Oficiais';
      } else if (groupName === 'St/Sgt') {
        return rep === 'St/Sgt';
      } else { // CbSd
        return ['1º Esqd', '2º Esqd', '3º Esqd', 'Esqd Cap', 'Fanfarra'].includes(rep);
      }
    }).length;
  };

  const oficiaisCafe = countMealsForGroup('Oficiais', 'cafe');
  const oficiaisAlmoco = countMealsForGroup('Oficiais', 'almoco');
  const oficiaisJantar = countMealsForGroup('Oficiais', 'jantar');
  const oficiaisAlim = countUniqueForGroup('Oficiais');

  const stsgtCafe = countMealsForGroup('St/Sgt', 'cafe');
  const stsgtAlmoco = countMealsForGroup('St/Sgt', 'almoco');
  const stsgtJantar = countMealsForGroup('St/Sgt', 'jantar');
  const stsgtAlim = countUniqueForGroup('St/Sgt');

  const cbsdCafe = countMealsForGroup('CbSd', 'cafe');
  const cbsdAlmoco = countMealsForGroup('CbSd', 'almoco');
  const cbsdJantar = countMealsForGroup('CbSd', 'jantar');
  const cbsdAlim = countUniqueForGroup('CbSd');

  const totalCafe = oficiaisCafe + stsgtCafe + cbsdCafe;
  const totalAlmoco = oficiaisAlmoco + stsgtAlmoco + cbsdAlmoco;
  const totalJantar = oficiaisJantar + stsgtJantar + cbsdJantar;
  const totalAlim = oficiaisAlim + stsgtAlim + cbsdAlim;

  const startX = 15;
  const endX = 195;
  
  // 1. Draw Header Box
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(15, 15, 180, 25); // Outer header box
  
  doc.setLineWidth(0.15);
  doc.line(45, 15, 45, 40); // Vertical line separating VISTO from Title
  doc.line(15, 25, 45, 25); // Horizontal line dividing VISTO from Fisc Adm label
  doc.line(45, 30, 151, 30); // Horizontal line separating unit header from document title (stops at date column 151)
  doc.line(151, 15, 151, 40); // Vertical line separating Unit/Title area from Date area on the right

  // Place texts in top box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('VISTO', 30, 20, { align: 'center' });
  doc.line(18, 23, 42, 23); // line for signing visto
  doc.text('Fisc Adm', 30, 32, { align: 'center' });
  doc.line(18, 36, 42, 36); // line for signing Fisc Adm

  // Unit Title (centered in middle area x = 45 to 151, so center is 98)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const subUnitTitle = selectedReparticao !== 'Todas' 
    ? `7º R C MEC - ${selectedReparticao.toUpperCase()}`
    : '7º R C MEC - ESQD C AP';
  doc.text(subUnitTitle, 98, 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Unidade - Subunidade', 98, 26, { align: 'center' });

  // Document Title (centered in middle area x = 45 to 151, so center is 98)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Vale Diário de Rações para o dia', 98, 36, { align: 'center' });

  // Date (centered in the right merged cell x = 151 to 195, so center is 173, vertically centered at 29)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(formattedDate, 173, 29, { align: 'center' });

  // 2. Draw Table
  const startY = 40;
  const endY = 225;
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, 180, endY - startY);

  // Draw Vertical lines for columns
  const colWidths = [28, 10, 10, 10, 28, 10, 10, 10, 10, 10, 22, 22];
  let accX = startX;
  doc.setLineWidth(0.15);
  for (let i = 0; i < colWidths.length - 1; i++) {
    accX += colWidths[i];
    // Do not split header cells for QUANTITATIVO (x=141) and COMPLEMENTOS (x=173) between y=40 and y=48
    const lineStartY = (accX === 141 || accX === 173) ? 48 : startY;
    doc.line(accX, lineStartY, accX, endY);
  }

  // Horizontal line at y = 65 separating headers from rows
  doc.line(startX, 65, endX, 65);

  // Sub-headers horizontal lines
  doc.line(131, 48, 151, 48); // QUANTITATIVO subline
  doc.line(151, 48, 195, 48); // COMPLEMENTOS subline

  // Draw row lines (19 data rows + SOMA row)
  let rY = 65;
  for (let row = 1; row <= 19; row++) {
    rY += 8;
    doc.line(startX, rY, endX, rY);
  }

  // 3. Draw Header Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  
  // Col 1 Title
  doc.text('ETAPAS COMPLETAS', 29, 54, { align: 'center' });

  // Helper for vertical letters
  const drawVertical = (text: string, x: number, yStart: number, spacing: number = 2.8) => {
    const chars = text.split('');
    chars.forEach((char, idx) => {
      doc.text(char, x, yStart + idx * spacing, { align: 'center' });
    });
  };

  // Vertical Col 2-4 headers
  drawVertical('CAFÉ', 48, 45);
  drawVertical('ALMOÇO', 58, 44);
  drawVertical('JANTAR', 68, 44);

  // Col 5 Title
  doc.text('ETAPAS COMPLETAS', 87, 54, { align: 'center' });

  // Vertical Col 6-8 headers
  drawVertical('ALIMENTAR', 106, 42, 2.2);
  drawVertical('ALIM OUTRAS OM', 116, 42, 1.5);
  drawVertical('SOMA', 126, 48);

  // Col 9 Main & Sub headers
  doc.text('QUANTI-', 141, 44, { align: 'center' });
  doc.text('TATIVO', 141, 47, { align: 'center' });
  drawVertical('TIPO', 136, 52);
  drawVertical('QTD', 146, 53);

  // Col 10 Main & Sub headers
  doc.text('COMPLEMENTOS', 173, 45, { align: 'center' });
  drawVertical('CHOSP', 162, 52);
  drawVertical('CF60%', 184, 52);

  // 4. Fill Row Data
  // Row 1: OFICIAIS
  let rowY = 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('OFICIAIS', 29, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisCafe), 48, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisAlmoco), 58, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisJantar), 68, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisAlim), 106, rowY + 5.2, { align: 'center' });
  doc.text('0', 116, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisAlim), 126, rowY + 5.2, { align: 'center' });
  doc.text('QR', 136, rowY + 5.2, { align: 'center' });
  doc.text(String(oficiaisAlim), 146, rowY + 5.2, { align: 'center' });

  // Row 2: ST/SGT
  rowY += 8;
  doc.text('ST/SGT', 29, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtCafe), 48, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtAlmoco), 58, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtJantar), 68, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtAlim), 106, rowY + 5.2, { align: 'center' });
  doc.text('0', 116, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtAlim), 126, rowY + 5.2, { align: 'center' });
  doc.text('QR', 136, rowY + 5.2, { align: 'center' });
  doc.text(String(stsgtAlim), 146, rowY + 5.2, { align: 'center' });

  // Row 3: CB/SD
  rowY += 8;
  doc.text('CB/SD', 29, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdCafe), 48, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdAlmoco), 58, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdJantar), 68, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdAlim), 106, rowY + 5.2, { align: 'center' });
  doc.text('0', 116, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdAlim), 126, rowY + 5.2, { align: 'center' });
  doc.text('QR', 136, rowY + 5.2, { align: 'center' });
  doc.text(String(cbsdAlim), 146, rowY + 5.2, { align: 'center' });

  // SOMA Row (y = 217)
  const somaY = 217;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SOMA', 29, somaY + 5.2, { align: 'center' });
  doc.text(String(totalCafe), 48, somaY + 5.2, { align: 'center' });
  doc.text(String(totalAlmoco), 58, somaY + 5.2, { align: 'center' });
  doc.text(String(totalJantar), 68, somaY + 5.2, { align: 'center' });
  doc.text(String(totalAlim), 106, somaY + 5.2, { align: 'center' });
  doc.text('0', 116, somaY + 5.2, { align: 'center' });
  doc.text(String(totalAlim), 126, somaY + 5.2, { align: 'center' });
  doc.text('CF', 136, somaY + 5.2, { align: 'center' });
  doc.text(String(totalAlim), 146, somaY + 5.2, { align: 'center' });

  // 5. Draw Footer (Location, Date and Signatures)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Quartel em Santana do Livramento', 15, 238);
  doc.setFont('helvetica', 'normal');
  doc.text(previousDayFormatted, 80, 238);

  // Signature lines
  doc.setLineWidth(0.35);
  doc.line(110, 245, 145, 245);
  doc.line(155, 245, 190, 245);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cmt SU', 127.5, 249, { align: 'center' });
  doc.text('Furriel', 172.5, 249, { align: 'center' });
}

export function generateRelatorioMilitaresEsqdPDF(
  users: FirebaseUser[],
  esquadrao: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const filteredUsers = users
    .filter(u => u.reparticao.toLowerCase().trim() === esquadrao.toLowerCase().trim())
    .sort((a, b) => a.usuario.localeCompare(b.usuario));

  // Outer border - Vinho Color Theme
  doc.setDrawColor(122, 12, 12); // Vinho
  doc.setLineWidth(0.6);
  doc.rect(5, 5, 200, 287);

  // Inner border
  doc.setDrawColor(201, 162, 39); // Ouro
  doc.setLineWidth(0.25);
  doc.rect(6.2, 6.2, 197.6, 284.6);

  // Header
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MINISTÉRIO DA DEFESA', 105, 14, { align: 'center' });
  doc.text('EXÉRCITO BRASILEIRO', 105, 18, { align: 'center' });
  doc.text('7º REGIMENTO DE CAVALARIA MECANIZADO', 105, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('REGIMENTO DA FRONTEIRA', 105, 26, { align: 'center' });

  doc.setDrawColor(122, 12, 12);
  doc.setLineWidth(0.4);
  doc.line(15, 29, 195, 29);

  // Document Title
  doc.setTextColor(122, 12, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`MILITARES CADASTRADOS - ${esquadrao.toUpperCase()}`, 105, 37, { align: 'center' });

  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  |  ARRANCHA+`, 15, 43);

  // Draw Table
  let y = 47;
  const colX = {
    num: 15,
    name: 25,
    reparticao: 80,
    nivel: 120,
    signature: 145
  };

  // Table Header Row
  doc.setFillColor(122, 12, 12);
  doc.rect(15, y, 180, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Nº', colX.num + 2, y + 4.5);
  doc.text('NOME DE GUERRA', colX.name + 3, y + 4.5);
  doc.text('SUBDIVISÃO', colX.reparticao + 3, y + 4.5);
  doc.text('NÍVEL', colX.nivel + 2, y + 4.5);
  doc.text('ASSINATURA', colX.signature + 5, y + 4.5);

  y += 6.5;

  let pageNum = 1;
  doc.setTextColor(120, 120, 120);
  doc.text(`Página ${pageNum}`, 185, 43);

  filteredUsers.forEach((u, idx) => {
    // Check overflow
    if (y > 255) {
      doc.addPage();
      pageNum++;
      
      // Outer border - Vinho Color Theme
      doc.setDrawColor(122, 12, 12); // Vinho
      doc.setLineWidth(0.6);
      doc.rect(5, 5, 200, 287);

      // Inner border
      doc.setDrawColor(201, 162, 39); // Ouro
      doc.setLineWidth(0.25);
      doc.rect(6.2, 6.2, 197.6, 284.6);

      // Header
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('MINISTÉRIO DA DEFESA', 105, 14, { align: 'center' });
      doc.text('EXÉRCITO BRASILEIRO', 105, 18, { align: 'center' });
      doc.text('7º REGIMENTO DE CAVALARIA MECANIZADO', 105, 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('REGIMENTO DA FRONTEIRA', 105, 26, { align: 'center' });

      doc.setDrawColor(122, 12, 12);
      doc.setLineWidth(0.4);
      doc.line(15, 29, 195, 29);

      // Document Title
      doc.setTextColor(122, 12, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`MILITARES CADASTRADOS - ${esquadrao.toUpperCase()} (CONT.)`, 105, 37, { align: 'center' });

      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  |  ARRANCHA+`, 15, 43);
      doc.text(`Página ${pageNum}`, 185, 43);

      y = 47;

      // Table Header Row
      doc.setFillColor(122, 12, 12);
      doc.rect(15, y, 180, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Nº', colX.num + 2, y + 4.5);
      doc.text('NOME DE GUERRA', colX.name + 3, y + 4.5);
      doc.text('SUBDIVISÃO', colX.reparticao + 3, y + 4.5);
      doc.text('NÍVEL', colX.nivel + 2, y + 4.5);
      doc.text('ASSINATURA', colX.signature + 5, y + 4.5);

      y += 6.5;
    }

    // Alternate backgrounds
    if (idx % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(15, y, 180, 6, 'F');
    }

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.rect(15, y, 180, 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);

    // Print text
    doc.text(String(idx + 1), colX.num + 3, y + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text(u.usuario, colX.name + 3, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(u.reparticao, colX.reparticao + 3, y + 4.2);
    doc.text(u.nivel, colX.nivel + 2, y + 4.2);

    // Signature line
    doc.setDrawColor(200, 200, 200);
    doc.line(colX.signature + 3, y + 4.8, colX.signature + 47, y + 4.8);

    y += 6;
  });

  // Location Date & Signatures
  if (y > 235) {
    doc.addPage();
    // borders etc
    doc.setDrawColor(122, 12, 12);
    doc.setLineWidth(0.6);
    doc.rect(5, 5, 200, 287);
    doc.setDrawColor(201, 162, 39);
    doc.setLineWidth(0.25);
    doc.rect(6.2, 6.2, 197.6, 284.6);
    y = 47;
  }

  y += 15;

  // Format full date in Portuguese
  const getTodayFormattedDate = () => {
    try {
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const todayObj = new Date();
      return `Santana do Livramento, RS, ${todayObj.getDate()} de ${months[todayObj.getMonth()]} de ${todayObj.getFullYear()}.`;
    } catch (e) {
      return `Santana do Livramento, RS, 2026`;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(getTodayFormattedDate(), 105, y, { align: 'center' });

  y += 18;

  // Signatures
  doc.setLineWidth(0.35);
  doc.setDrawColor(122, 12, 12);
  doc.line(25, y, 90, y);
  doc.line(120, y, 185, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FURRIEL', 57, y + 4, { align: 'center' });
  doc.text('CMT DE ESQUADRÃO', 152, y + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Assinatura / Carimbo', 57, y + 8, { align: 'center' });
  doc.text('Assinatura / Carimbo', 152, y + 8, { align: 'center' });

  doc.save(`relatorio_militares_${esquadrao.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}
