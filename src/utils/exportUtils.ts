/**
 * Utilitários para exportar dados em PDF, XML e XLSX
 */

import {
  applyPdfBrandingHeader,
  buildPdfPrintHeaderHtml,
  getPdfBranding,
  hexToRgb
} from './pdfBranding';

// Função para exportar dados em XLSX
export const exportToXLSX = async (
  data: any[],
  filename: string,
  columns: { key: string; label: string; width?: number }[]
): Promise<void> => {
  try {
    const XLSX = await import('xlsx');

    // Preparar dados para a planilha
    const worksheetData = [
      // Cabeçalhos
      columns.map(col => col.label),
      // Dados
      ...data.map(item =>
        columns.map(col => {
          const value = item[col.key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (value instanceof Date) return value.toLocaleString('pt-BR');
          return value;
        })
      )
    ];

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Ajustar largura das colunas
    const columnWidths = columns.map(col => ({
      wch: col.width || Math.max(col.label.length, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // Adicionar data de exportação em uma segunda aba
    const infoData = [
      ['Data de Exportação', new Date().toLocaleString('pt-BR')],
      ['Total de Registros', data.length],
      ['Colunas', columns.length]
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações');

    // Salvar arquivo
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    throw new Error('Erro ao exportar dados em XLSX');
  }
};

// Função para exportar dados em XML
export const exportToXML = (data: any[], filename: string, rootElement: string = 'data'): void => {
  try {
    // Criar elemento raiz
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<${rootElement}>\n`;

    // Adicionar cada item como elemento
    data.forEach((item, index) => {
      xml += `  <item id="${index + 1}">\n`;
      Object.entries(item).forEach(([key, value]) => {
        // Escapar caracteres especiais XML
        const escapedValue = String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        xml += `    <${key}>${escapedValue}</${key}>\n`;
      });
      xml += `  </item>\n`;
    });

    xml += `</${rootElement}>`;

    // Criar blob e fazer download
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xml`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar XML:', error);
    throw new Error('Erro ao exportar dados em XML');
  }
};

// Função para exportar dados em PDF (usando canvas e texto simples)
export const exportToPDF = async (
  data: any[],
  filename: string,
  title: string,
  columns: { key: string; label: string; width?: number }[]
): Promise<void> => {
  try {
    // Verificar se jspdf está disponível, caso contrário usar método alternativo
    let jsPDF: any;

    try {
      jsPDF = (await import('jspdf')).default;
      await import('jspdf-autotable');
    } catch (error) {
      // Fallback: criar PDF simples usando canvas
      return exportToPDFSimple(data, filename, title, columns);
    }

    const doc = new jsPDF();
    const branding = await getPdfBranding();
    const tableStartY = await applyPdfBrandingHeader(doc, title, branding);
    const headColor = hexToRgb(branding?.primaryColor || '#22c55e');

    // Preparar dados para a tabela
    const tableData = data.map(item =>
      columns.map(col => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    const tableHeaders = columns.map(col => col.label);

    // Adicionar tabela
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: tableStartY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: headColor },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: tableStartY }
    });

    // Salvar PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    // Fallback para método simples
    return exportToPDFSimple(data, filename, title, columns);
  }
};

// Método alternativo simples para PDF (sem biblioteca externa)
const exportToPDFSimple = async (
  data: any[],
  _filename: string,
  title: string,
  columns: { key: string; label: string; width?: number }[]
): Promise<void> => {
  const branding = await getPdfBranding();
  const headerHtml = buildPdfPrintHeaderHtml(branding, title);
  const accent = branding?.primaryColor || '#22c55e';

  // Criar HTML para impressão
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page { margin: 1cm; }
          body { margin: 0; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 { margin-bottom: 10px; }
        .date { color: #666; margin-bottom: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: ${accent};
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
      </style>
    </head>
    <body>
      ${headerHtml}
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => {
    const value = item[col.key];
    const displayValue = value === null || value === undefined
      ? ''
      : (typeof value === 'object' ? JSON.stringify(value) : String(value));
    return `<td>${displayValue}</td>`;
  }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Abrir em nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

// Função para importar XLSX
export const importFromXLSX = (file: File): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Erro ao ler arquivo'));
            return;
          }

          // Ler workbook
          const workbook = XLSX.read(data, { type: 'binary' });

          // Pegar a primeira planilha
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Usar array de arrays
            defval: '', // Valor padrão para células vazias
            raw: false // Converter números para strings
          });

          if (jsonData.length === 0) {
            reject(new Error('Arquivo Excel está vazio'));
            return;
          }

          // Detectar onde estão os cabeçalhos reais
          // Verificar as primeiras 5 linhas para encontrar cabeçalhos
          let headerRowIndex = 0;
          const headerKeywords = ['cliente', 'email', 'telefone', 'nome', 'empresa', 'cpf', 'cnpj', 'cep', 'cidade', 'estado', 'celular', 'logradouro', 'bairro', 'complemento', 'endereco', 'endereço'];

          // Verificar se a primeira linha parece ser cabeçalhos (valores como "CLIENTE", "EMAIL", etc.)
          for (let rowIdx = 0; rowIdx < Math.min(5, jsonData.length); rowIdx++) {
            const row = (jsonData[rowIdx] as any[]).map((h: any) => String(h || '').trim());
            const rowText = row.join(' ').toLowerCase();

            // PRIMEIRO: Verificar se os valores da linha são exatamente palavras de cabeçalho (como "CLIENTE", "EMAIL")
            // Uma linha de cabeçalhos normalmente tem múltiplas células com palavras-chave curtas
            const nonEmptyCells = row.filter(cell => cell && cell !== '');
            const cellsMatchingHeaders = nonEmptyCells.filter(cell => {
              const cellLower = cell.toLowerCase()
                .replace(/\*/g, '') // Remover asteriscos
                .replace(/\n/g, ' ') // Remover quebras de linha
                .replace(/\([^)]*\)/g, '') // Remover texto entre parênteses
                .trim();
              return headerKeywords.some(keyword => {
                const normalizedCell = cellLower.replace(/[^a-z0-9]/g, '');
                const normalizedKeyword = keyword.replace(/[^a-z0-9]/g, '');
                return normalizedCell === normalizedKeyword || normalizedCell.startsWith(normalizedKeyword);
              });
            });

            // Se pelo menos 50% das células não vazias são palavras de cabeçalho, é uma linha de cabeçalhos
            const isHeaderRow = nonEmptyCells.length > 0 && (cellsMatchingHeaders.length / nonEmptyCells.length) >= 0.5;

            // SEGUNDO: Ignorar linhas que são claramente títulos ou instruções (apenas uma célula preenchida com texto longo)
            const isSingleCellWithLongText = nonEmptyCells.length === 1 && nonEmptyCells[0].length > 30;
            const isTitleOrInstruction = isSingleCellWithLongText && (
              rowText.includes('planilha') ||
              rowText.includes('obrigat') ||
              rowText.includes('preenchimento') ||
              rowText.includes('cadastrar') ||
              rowText.includes('colunas com')
            );

            if (isTitleOrInstruction) {
              console.log(`Linha ${rowIdx + 1} ignorada (parece ser título/instrução):`, row[0]?.substring(0, 50));
              continue;
            }

            if (isHeaderRow) {
              headerRowIndex = rowIdx;
              console.log(`Cabeçalhos detectados na linha ${rowIdx + 1}:`, row);
              break;
            }
          }

          // Primeira linha são os cabeçalhos
          const rawHeaders = (jsonData[headerRowIndex] as any[]).map((h: any) => String(h || '').trim());
          console.log('Headers originais do arquivo (linha ' + (headerRowIndex + 1) + '):', rawHeaders);

          const headers = rawHeaders.map((h: string, index: number) => {
            if (!h || h === '') {
              // Se o header estiver vazio, criar um nome baseado no índice
              return `coluna_${index + 1}`;
            }

            let header = h;
            // Remover asteriscos, quebras de linha e texto entre parênteses antes de normalizar
            header = header
              .replace(/\*/g, '') // Remove asteriscos
              .replace(/\n/g, ' ') // Substitui quebras de linha por espaço
              .replace(/\([^)]*\)/g, '') // Remove texto entre parênteses
              .trim();

            // Normalizar: remover acentos, espaços extras, converter para minúsculas
            header = header
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove acentos
              .toLowerCase()
              .replace(/\s+/g, '_') // Substitui espaços por underscore
              .replace(/[^a-z0-9_]/g, '') // Remove caracteres especiais
              .replace(/^_+|_+$/g, ''); // Remove underscores no início/fim

            // Se após normalização ficar vazio, usar o índice
            if (!header || header === '') {
              header = `coluna_${index + 1}`;
            }

            return header;
          });

          console.log('Headers normalizados:', headers);
          console.log('Total de linhas de dados:', jsonData.length - headerRowIndex - 1);

          // Converter para array de objetos
          const dataArray: any[] = [];

          // Começar a partir da linha após os cabeçalhos detectados
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            // Verificar se a linha tem dados (não é apenas células vazias)
            const hasData = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
            if (!hasData) continue;

            const obj: any = {};
            headers.forEach((header, index) => {
              if (header && header !== '') {
                let value: any = row[index];

                // Converter string vazia para null
                if (value === '' || value === null || value === undefined) {
                  value = null;
                }
                // Tentar converter para número
                else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
                  const numValue = Number(value);
                  if (!isNaN(numValue)) {
                    value = numValue;
                  }
                }
                // Tentar converter para boolean
                else if (typeof value === 'string') {
                  const lowerValue = value.toLowerCase().trim();
                  if (lowerValue === 'true' || lowerValue === 'sim' || lowerValue === 'yes') {
                    value = true;
                  } else if (lowerValue === 'false' || lowerValue === 'não' || lowerValue === 'no') {
                    value = false;
                  }
                  // Tentar converter para data
                  else if (value.match(/^\d{2}\/\d{2}\/\d{4}/) || value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    const dateValue = new Date(value);
                    if (!isNaN(dateValue.getTime())) {
                      value = dateValue.toISOString();
                    }
                  }
                }

                // Usar o header já normalizado (sempre adicionar, mesmo se vazio)
                obj[header] = value;
              }
            });

            // Log da primeira linha processada para debug
            if (i === headerRowIndex + 1) {
              console.log('Primeira linha de dados processada:', {
                rowOriginal: row,
                headers: headers,
                objetoCriado: obj,
                chavesNoObjeto: Object.keys(obj),
                valoresNoObjeto: Object.entries(obj)
              });
            }

            // Só adicionar se o objeto não estiver vazio e tiver pelo menos uma propriedade
            if (Object.keys(obj).length > 0) {
              dataArray.push(obj);
            }
          }

          console.log('Dados processados:', dataArray);
          console.log('Total de objetos criados:', dataArray.length);

          if (dataArray.length === 0) {
            reject(new Error('Nenhum dado válido encontrado no arquivo Excel'));
            return;
          }

          resolve(dataArray);
        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel: ' + (error instanceof Error ? error.message : 'Erro desconhecido')));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      reject(new Error('Erro ao importar arquivo Excel: ' + (error instanceof Error ? error.message : 'Erro desconhecido')));
    }
  });
};

// Função para importar XML
export const importFromXML = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');

        // Verificar erros de parsing
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          reject(new Error('Erro ao processar arquivo XML. Verifique se o arquivo está bem formatado.'));
          return;
        }

        // Extrair dados do XML
        const items = xmlDoc.querySelectorAll('item');
        const data: any[] = [];

        items.forEach((item) => {
          const obj: any = {};
          const children = item.children;

          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const key = child.tagName;
            let value: any = child.textContent || '';

            // Tentar converter para número se possível
            if (!isNaN(Number(value)) && value !== '') {
              value = Number(value);
            }
            // Tentar converter para boolean
            else if (value === 'true' || value === 'false') {
              value = value === 'true';
            }
            // Tentar converter para data
            else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
              value = new Date(value);
            }

            obj[key] = value;
          }

          data.push(obj);
        });

        resolve(data);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo XML: ' + (error instanceof Error ? error.message : 'Erro desconhecido')));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file);
  });
};

// Função para obter colunas padrão baseado no tipo de dados
export const getDefaultColumns = (data: any[], sampleSize: number = 5): { key: string; label: string }[] => {
  if (data.length === 0) return [];

  const sample = data.slice(0, sampleSize);
  const allKeys = new Set<string>();

  sample.forEach(item => {
    Object.keys(item).forEach(key => {
      if (typeof item[key] !== 'object' || item[key] === null) {
        allKeys.add(key);
      }
    });
  });

  return Array.from(allKeys).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
  }));
};
