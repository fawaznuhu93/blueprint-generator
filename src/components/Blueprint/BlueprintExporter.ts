import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBlueprintAsPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    alert('Blueprint canvas not found. Please try again.');
    return false;
  }
  
  try {
    // Find the canvas inside the element
    const canvas = element.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas not found inside element');
      alert('Canvas not found. Please refresh and try again.');
      return false;
    }
    
    // Create PDF with exact dimensions
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
    return false;
  }
};

export const exportBlueprintAsSVG = (blueprint: any): string => {
  // Generate SVG from blueprint data
  const width = 800;
  const height = 600;
  const scale = 3;
  const padding = 40;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: white; font-family: Arial, sans-serif;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grid)"/>`;
  
  // Add rooms
  blueprint.rooms.forEach((room: any, index: number) => {
    const x = room.position.x * scale + padding;
    const y = room.position.y * scale + padding;
    const roomWidth = room.width * scale;
    const roomHeight = room.depth * scale;
    
    svg += `
  <rect x="${x}" y="${y}" width="${roomWidth}" height="${roomHeight}" 
        fill="${room.color}20" stroke="${room.color}" stroke-width="2" rx="2"/>
  
  <text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 - 5}" 
        text-anchor="middle" font-size="12" fill="#1f2937" font-weight="bold">
    ${room.name}
  </text>
  
  <text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 + 10}" 
        text-anchor="middle" font-size="10" fill="#6b7280">
    ${room.width}' x ${room.depth}'
  </text>
  
  <text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 + 22}" 
        text-anchor="middle" font-size="9" fill="#9ca3af">
    ${room.area} sq ft
  </text>`;
  });
  
  // Add title block
  svg += `
  <rect x="10" y="${height - 70}" width="220" height="60" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  <text x="20" y="${height - 50}" font-size="10" fill="#1e293b" font-weight="bold">${blueprint.buildingType.toUpperCase()} BLUEPRINT</text>
  <text x="20" y="${height - 38}" font-size="8" fill="#64748b">Scale: 1/4" = 1'-0"</text>
  <text x="20" y="${height - 26}" font-size="8" fill="#64748b">Total Area: ${blueprint.totalArea} sq ft</text>
  <text x="20" y="${height - 14}" font-size="8" fill="#64748b">Rooms: ${blueprint.rooms.length}</text>`;
  
  svg += `\n</svg>`;
  return svg;
};