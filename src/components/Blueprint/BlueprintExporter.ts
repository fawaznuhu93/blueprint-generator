import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportBlueprintAsPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }
  
  try {
    // Get the canvas element inside
    const canvas = element.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas not found inside element');
      return;
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
  // Generate SVG from actual blueprint data
  const gridSize = blueprint.unit === 'feet' ? 20 : 6;
  const padding = 20;
  
  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  
  blueprint.rooms.forEach((room: any) => {
    const x = room.position.x * gridSize + padding;
    const y = room.position.y * gridSize + padding;
    const right = x + room.width * gridSize;
    const bottom = y + room.depth * gridSize;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });
  
  const width = maxX - minX + 100;
  const height = maxY - minY + 100;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: white;">`;
  
  // Add grid
  svg += `<defs>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
    </pattern>
  </defs>`;
  
  svg += `<rect width="100%" height="100%" fill="url(#grid)"/>`;
  
  // Add rooms
  blueprint.rooms.forEach((room: any) => {
    const x = room.position.x * gridSize + padding - minX + 50;
    const y = room.position.y * gridSize + padding - minY + 50;
    const roomWidth = room.width * gridSize;
    const roomHeight = room.depth * gridSize;
    
    svg += `<rect x="${x}" y="${y}" width="${roomWidth}" height="${roomHeight}" 
            fill="${room.color}40" stroke="${room.color}" stroke-width="2"/>`;
    
    svg += `<text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 - 5}" 
            text-anchor="middle" font-family="Arial" font-size="12" fill="#1f2937" font-weight="bold">
            ${room.name}</text>`;
    
    svg += `<text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 + 10}" 
            text-anchor="middle" font-family="Arial" font-size="10" fill="#6b7280">
            ${room.width}'×${room.depth}'</text>`;
    
    svg += `<text x="${x + roomWidth / 2}" y="${y + roomHeight / 2 + 22}" 
            text-anchor="middle" font-family="Arial" font-size="9" fill="#6b7280">
            ${room.area} SF</text>`;
    
    // Add doors
    room.doors.forEach((door: any) => {
      let doorX = x, doorY = y;
      if (door.wall === 'south') {
        doorX = x + roomWidth * door.position;
        doorY = y + roomHeight;
        svg += `<path d="M ${doorX} ${doorY} Q ${doorX + 15} ${doorY - 15} ${doorX} ${doorY - 15}" 
                fill="none" stroke="#92400e" stroke-width="2"/>`;
        svg += `<line x1="${doorX}" y1="${doorY}" x2="${doorX}" y2="${doorY - 15}" 
                stroke="#92400e" stroke-width="2"/>`;
      }
    });
  });
  
  // Add title block
  svg += `<rect x="10" y="${height - 60}" width="200" height="50" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>`;
  svg += `<text x="20" y="${height - 45}" font-family="Arial" font-size="10" fill="#1e293b" font-weight="bold">${blueprint.buildingType.toUpperCase()} BLUEPRINT</text>`;
  svg += `<text x="20" y="${height - 33}" font-family="Arial" font-size="8" fill="#64748b">Scale: 1/4" = 1'-0"</text>`;
  svg += `<text x="20" y="${height - 23}" font-family="Arial" font-size="8" fill="#64748b">Total Area: ${blueprint.totalArea} SF</text>`;
  
  svg += '</svg>';
  return svg;
};