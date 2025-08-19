// Utilidades centralizadas para generación de PDFs con jsPDF + autoTable
// Maneja carga de imágenes, encabezado, pie, metadatos y estilos comunes

export function loadImageToBase64(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function setDocMeta(doc, meta = {}) {
  const { title = 'Documento', subject = 'Reporte' } = meta;
  doc.setProperties({ title, subject, creator: 'SGI-HULUX', author: 'SGI-HULUX' });
}

export function addHeader(doc, title, logoBase64) {
  const marginTop = 10;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 14, marginTop, 25, 12);
  }
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14 + (logoBase64 ? 30 : 0), marginTop + 8);
  doc.setLineWidth(0.4);
  doc.line(14, marginTop + 14, 195, marginTop + 14);
}

export function addFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('SGI-HULUX ©', 195 - 14, 290, { align: 'right' });
  }
}

export const defaultTableTheme = {
  headStyles: { fillColor: [32, 132, 209], textColor: 255, fontStyle: 'bold' },
  bodyStyles: { fontSize: 10 },
  styles: { cellPadding: 3, overflow: 'linebreak' },
  alternateRowStyles: { fillColor: [245, 248, 255] },
};
