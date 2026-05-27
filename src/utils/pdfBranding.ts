import { tenantService, type TenantBranding } from '../services/tenantService';

export type PdfBranding = Pick<TenantBranding, 'name' | 'logoUrl' | 'primaryColor'>;

export async function getPdfBranding(): Promise<PdfBranding | null> {
  try {
    const b = await tenantService.getBranding();
    if (!b) return null;
    return { name: b.name, logoUrl: b.logoUrl, primaryColor: b.primaryColor };
  } catch {
    return null;
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0]! + cleaned[0]!, 16);
    const g = parseInt(cleaned[1]! + cleaned[1]!, 16);
    const b = parseInt(cleaned[2]! + cleaned[2]!, 16);
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const n = parseInt(cleaned, 16);
    if (!Number.isNaN(n)) {
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  }
  return [34, 197, 94];
}

export async function resolveImageForPdf(
  url: string
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    if (url.startsWith('data:')) {
      const format = url.includes('image/png') ? 'PNG' : 'JPEG';
      return { dataUrl: url, format };
    }
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUrl, format };
  } catch {
    return null;
  }
}

export function getPdfTableStartY(hasLogo: boolean): number {
  return hasLogo ? 48 : 35;
}

/** Cabeçalho com logo e cores do tenant; retorna Y inicial da tabela */
export async function applyPdfBrandingHeader(
  doc: {
    setFontSize: (n: number) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    text: (t: string, x: number, y: number) => void;
    addImage: (
      data: string,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number
    ) => void;
  },
  title: string,
  branding: PdfBranding | null
): Promise<number> {
  const hasLogo = Boolean(branding?.logoUrl);
  const primary = hexToRgb(branding?.primaryColor || '#22c55e');
  const tableStartY = getPdfTableStartY(hasLogo);

  if (branding?.logoUrl) {
    const img = await resolveImageForPdf(branding.logoUrl);
    if (img) {
      doc.addImage(img.dataUrl, img.format, 14, 10, 40, 18);
    }
  }

  doc.setFontSize(16);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(title, 14, hasLogo ? 34 : 22);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  const prefix = branding?.name ? `${branding.name} · ` : '';
  doc.text(`${prefix}Exportado em ${new Date().toLocaleString('pt-BR')}`, 14, hasLogo ? 42 : 30);

  return tableStartY;
}

export function buildPdfPrintHeaderHtml(branding: PdfBranding | null, title: string): string {
  const primary = branding?.primaryColor || '#22c55e';
  const logoBlock = branding?.logoUrl
    ? `<img src="${branding.logoUrl}" alt="" style="max-height:56px;max-width:200px;margin-bottom:12px;" />`
    : '';
  const brandLine = branding?.name
    ? `<div style="font-size:12px;color:#666;margin-bottom:4px;">${branding.name}</div>`
    : '';
  return `
    ${logoBlock}
    ${brandLine}
    <h1 style="color:${primary};margin:0 0 8px;">${title}</h1>
    <div class="date">Exportado em: ${new Date().toLocaleString('pt-BR')}</div>
  `;
}
