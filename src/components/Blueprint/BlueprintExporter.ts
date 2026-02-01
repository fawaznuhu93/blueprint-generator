import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBlueprintAsPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 30;
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(`${filename}.pdf`);
};

export const exportBlueprintAsSVG = (blueprint: any): string => {
  // Simple SVG export for MVP
  const width = 800;
  const height = 600;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += '<rect width="100%" height="100%" fill="white"/>';
  
  // Add rooms
  blueprint.rooms.forEach((room: any) => {
    const x = room.position.x * 3;
    const y = room.position.y * 3;
    const roomWidth = room.width * 3;
    const roomHeight = room.depth * 3;
    
    svg += `<rect x="${x}" y="${y}" width="${roomWidth}" height="${roomHeight}" 
            fill="${room.color}40" stroke="${room.color}" stroke-width="2"/>`;
    
    svg += `<text x="${x + roomWidth / 2}" y="${y + roomHeight / 2}" 
            text-anchor="middle" font-family="Arial" font-size="12" fill="#1f2937">
            ${room.name}</text>`;
  });
  
  svg += '</svg>';
  return svg;
};