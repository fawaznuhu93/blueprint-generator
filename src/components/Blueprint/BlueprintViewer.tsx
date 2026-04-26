import { useEffect, useRef, useState } from 'react';
import { Download, Printer, Expand, Copy, Ruler, Info, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { exportBlueprintAsPDF } from './BlueprintExporter';
import { trackExport } from '../../utils/analytics';

type RoomType = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'office' | 'storage' | 'dining' | 'hallway' | 'storefront' | 'reception' | 'workspace' | 'meeting' | 'break';

interface Room {
  id: string;
  name: string;
  type: RoomType;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: Array<{
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }>;
  windows: Array<{
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }>;
}

interface BlueprintSpec {
  buildingType: string;
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: string;
  unit: 'feet' | 'meters';
  createdAt: string;
}

interface BlueprintViewerProps {
  blueprint: BlueprintSpec;
  onExportPDF: () => void;
}

export const BlueprintViewer = ({ blueprint, onExportPDF }: BlueprintViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (canvasRef.current && blueprint?.rooms && blueprint.rooms.length > 0) {
      drawProfessionalBlueprint(canvasRef.current, blueprint, scale);
    }
  }, [blueprint, scale]);

  const drawProfessionalBlueprint = (canvas: HTMLCanvasElement, spec: BlueprintSpec, scaleValue: number = 1) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions for professional print (Arch D size proportion)
    canvas.width = 1200;
    canvas.height = 900;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint background color (classic blue)
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint grid
    drawBlueprintGrid(ctx, canvas.width, canvas.height);
    
    // Safety check
    if (!spec.rooms || spec.rooms.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No rooms to display. Generate a blueprint first.', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    const gridSize = spec.unit === 'feet' ? 20 : 6;
    const padding = 80;
    const margin = 100;
    
    // Find bounds
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    
    spec.rooms.forEach(room => {
      if (room.position) {
        const x = room.position.x * gridSize;
        const y = room.position.y * gridSize;
        const right = x + room.width * gridSize;
        const bottom = y + room.depth * gridSize;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
      }
    });
    
    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;
    const availableWidth = canvas.width - margin * 2;
    const availableHeight = canvas.height - margin * 2 - 120;
    
    const fitScale = Math.min(availableWidth / totalWidth, availableHeight / totalHeight);
    const finalScale = fitScale * scaleValue;
    
    // Draw title block
    drawTitleBlock(ctx, canvas.width, canvas.height, spec);
    
    // Draw north arrow
    drawNorthArrow(ctx, canvas.width - 80, margin - 20);
    
    // Draw scale bar
    drawScaleBar(ctx, canvas.width - 200, canvas.height - 60, spec.unit);
    
    // Draw each room
    spec.rooms.forEach(room => {
      if (room.position) {
        const x = (room.position.x * gridSize - minX) * finalScale + margin;
        const y = (room.position.y * gridSize - minY) * finalScale + margin;
        const width = room.width * gridSize * finalScale;
        const depth = room.depth * gridSize * finalScale;
        
        drawRoom(ctx, room, x, y, width, depth, spec.unit, finalScale);
      }
    });
    
    // Draw overall dimensions
    drawOverallDimensions(ctx, spec, minX, minY, maxX, maxY, finalScale, margin, gridSize);
    
    // Draw legend
    drawLegend(ctx, margin, canvas.height - 80);
  };

  const drawBlueprintGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Major grid lines (every 40px)
    ctx.strokeStyle = '#2a5a8c';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Minor grid lines (every 10px)
    ctx.strokeStyle = '#1a4a7c';
    ctx.lineWidth = 0.3;
    
    for (let x = 0; x <= width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D, room: Room, x: number, y: number, width: number, depth: number, unit: string, scale: number) => {
    if (!room) return;
    
    // Draw exterior walls (thicker)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, depth);
    
    // Draw interior walls (thinner)
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, depth);
    
    // Draw room label
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, Math.min(16, width / 12))}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
      room.name?.toUpperCase() || 'ROOM',
      x + width / 2,
      y + depth / 2 - 8
    );
    
    // Draw dimensions
    ctx.font = `${Math.max(8, Math.min(12, width / 18))}px "Courier New", monospace`;
    ctx.fillStyle = '#a0c0e0';
    ctx.fillText(
      `${room.width}' x ${room.depth}'`,
      x + width / 2,
      y + depth / 2 + 10
    );
    
    // Draw area
    ctx.fillText(
      `${room.area} SF`,
      x + width / 2,
      y + depth / 2 + 25
    );
    
    // Draw doors
    if (room.doors && room.doors.length > 0) {
      room.doors.forEach(door => {
        drawDoorSymbol(ctx, x, y, width, depth, door);
      });
    } else {
      // Add default door on south wall
      drawDoorSymbol(ctx, x, y, width, depth, { wall: 'south', position: 0.5, width: 3 });
    }
    
    // Draw windows
    if (room.windows && room.windows.length > 0) {
      room.windows.forEach(window => {
        drawWindowSymbol(ctx, x, y, width, depth, window);
      });
    }
  };

  const drawDoorSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, door: any) => {
    ctx.strokeStyle = '#e0a040';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#e0a040';
    
    const doorWidth = 15; // pixels
    const doorSwingRadius = 20;
    
    switch(door.wall) {
      case 'south':
        const doorX = x + width * door.position;
        const doorY = y + depth;
        // Draw door rectangle
        ctx.fillRect(doorX - 3, doorY - 3, 6, 6);
        // Draw door swing arc
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorSwingRadius, 0, Math.PI / 2);
        ctx.stroke();
        // Draw door line
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorSwingRadius, doorY);
        ctx.stroke();
        break;
        
      case 'north':
        const doorXN = x + width * door.position;
        const doorYN = y;
        ctx.fillRect(doorXN - 3, doorYN - 3, 6, 6);
        ctx.beginPath();
        ctx.arc(doorXN, doorYN, doorSwingRadius, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(doorXN, doorYN);
        ctx.lineTo(doorXN - doorSwingRadius, doorYN);
        ctx.stroke();
        break;
        
      case 'east':
        const doorXE = x + width;
        const doorYE = y + depth * door.position;
        ctx.fillRect(doorXE - 3, doorYE - 3, 6, 6);
        ctx.beginPath();
        ctx.arc(doorXE, doorYE, doorSwingRadius, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(doorXE, doorYE);
        ctx.lineTo(doorXE, doorYE - doorSwingRadius);
        ctx.stroke();
        break;
        
      case 'west':
        const doorXW = x;
        const doorYW = y + depth * door.position;
        ctx.fillRect(doorXW - 3, doorYW - 3, 6, 6);
        ctx.beginPath();
        ctx.arc(doorXW, doorYW, doorSwingRadius, Math.PI / 2, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(doorXW, doorYW);
        ctx.lineTo(doorXW, doorYW + doorSwingRadius);
        ctx.stroke();
        break;
    }
  };

  const drawWindowSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, window: any) => {
    ctx.strokeStyle = '#60a0e0';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    
    const windowWidth = 30;
    
    switch(window.wall) {
      case 'north':
        const winX = x + width * window.position;
        const winY = y;
        ctx.beginPath();
        ctx.moveTo(winX - windowWidth / 2, winY);
        ctx.lineTo(winX + windowWidth / 2, winY);
        ctx.stroke();
        break;
        
      case 'south':
        const winXS = x + width * window.position;
        const winYS = y + depth;
        ctx.beginPath();
        ctx.moveTo(winXS - windowWidth / 2, winYS);
        ctx.lineTo(winXS + windowWidth / 2, winYS);
        ctx.stroke();
        break;
        
      case 'east':
        const winXE = x + width;
        const winYE = y + depth * window.position;
        ctx.beginPath();
        ctx.moveTo(winXE, winYE - windowWidth / 2);
        ctx.lineTo(winXE, winYE + windowWidth / 2);
        ctx.stroke();
        break;
        
      case 'west':
        const winXW = x;
        const winYW = y + depth * window.position;
        ctx.beginPath();
        ctx.moveTo(winXW, winYW - windowWidth / 2);
        ctx.lineTo(winXW, winYW + windowWidth / 2);
        ctx.stroke();
        break;
    }
    
    ctx.setLineDash([]);
  };

  const drawOverallDimensions = (ctx: CanvasRenderingContext2D, spec: BlueprintSpec, minX: number, minY: number, maxX: number, maxY: number, scale: number, margin: number, gridSize: number) => {
    if (minX === Infinity) return;
    
    const buildingWidth = ((maxX - minX) / gridSize);
    const buildingDepth = ((maxY - minY) / gridSize);
    
    const leftX = margin;
    const rightX = (maxX - minX) * scale + margin;
    const topY = margin;
    const bottomY = (maxY - minY) * scale + margin;
    
    ctx.strokeStyle = '#80c0e0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#80c0e0';
    ctx.font = '10px "Courier New", monospace';
    ctx.setLineDash([5, 5]);
    
    // Top dimension
    ctx.beginPath();
    ctx.moveTo(leftX, topY - 20);
    ctx.lineTo(rightX, topY - 20);
    ctx.stroke();
    ctx.fillText(
      `${buildingWidth.toFixed(1)}'`,
      (leftX + rightX) / 2,
      topY - 25
    );
    
    // Left dimension
    ctx.beginPath();
    ctx.moveTo(leftX - 20, topY);
    ctx.lineTo(leftX - 20, bottomY);
    ctx.stroke();
    ctx.save();
    ctx.translate(leftX - 35, (topY + bottomY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${buildingDepth.toFixed(1)}'`, 0, 0);
    ctx.restore();
    
    ctx.setLineDash([]);
  };

  const drawTitleBlock = (ctx: CanvasRenderingContext2D, width: number, height: number, spec: BlueprintSpec) => {
    const blockX = 20;
    const blockY = height - 100;
    const blockWidth = 350;
    const blockHeight = 80;
    
    // Title block border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);
    
    // Title block lines
    ctx.beginPath();
    ctx.moveTo(blockX + 120, blockY);
    ctx.lineTo(blockX + 120, blockY + blockHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(blockX, blockY + 40);
    ctx.lineTo(blockX + blockWidth, blockY + 40);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText('BLUEPRINT GENERATOR PRO', blockX + 10, blockY + 25);
    
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`PROJECT: ${spec.buildingType.toUpperCase()}`, blockX + 10, blockY + 55);
    ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, blockX + 10, blockY + 72);
    
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`TOTAL AREA: ${spec.totalArea.toFixed(0)} SF`, blockX + 135, blockY + 25);
    ctx.fillText(`ROOMS: ${spec.rooms?.length || 0}`, blockX + 135, blockY + 55);
    ctx.fillText(`SCALE: 1/4" = 1'-0"`, blockX + 135, blockY + 72);
  };

  const drawNorthArrow = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y - 15);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 8, y + 15);
    ctx.lineTo(x + 8, y + 15);
    ctx.closePath();
    ctx.fill();
  };

  const drawScaleBar = (ctx: CanvasRenderingContext2D, x: number, y: number, unit: string) => {
    const barWidth = 150;
    const barHeight = 8;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Courier New", monospace';
    ctx.textAlign = 'center';
    
    // Scale bar segments
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, barWidth / 2, barHeight);
    ctx.fillStyle = '#2a5a8c';
    ctx.fillRect(x + barWidth / 2, y, barWidth / 2, barHeight);
    
    // Tick marks
    for (let i = 0; i <= 4; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (barWidth / 4) * i, y - 3, 1, barHeight + 6);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText('0', x, y + 18);
    ctx.fillText(`20${unit}`, x + barWidth / 2, y + 18);
    ctx.fillText(`40${unit}`, x + barWidth, y + 18);
    
    ctx.fillText('SCALE BAR', x + barWidth / 2, y - 8);
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Courier New", monospace';
    
    // Legend border
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(x, y - 5, 200, 50);
    
    ctx.fillText('LEGEND:', x + 5, y + 8);
    
    // Door symbol
    ctx.fillStyle = '#e0a040';
    ctx.fillRect(x + 70, y - 2, 8, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DOOR', x + 85, y + 5);
    
    // Window symbol
    ctx.strokeStyle = '#60a0e0';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 70, y + 12);
    ctx.lineTo(x + 78, y + 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('WINDOW', x + 85, y + 18);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2))
      .then(() => alert('Blueprint JSON copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
    trackExport('json');
  };

  if (!blueprint || !blueprint.rooms || blueprint.rooms.length === 0) {
    return (
      <div className="bg-[#1a3a5c] rounded-xl border border-gray-600 p-8 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ruler className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-white">No Blueprint Available</h3>
        <p className="text-sm text-gray-300 mt-2">Generate a blueprint to see the visualization here.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a3a5c] rounded-xl border border-gray-600 overflow-hidden">
      <div className="bg-[#0d2a45] text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-600">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base font-mono">{blueprint.buildingType?.charAt(0).toUpperCase() + blueprint.buildingType?.slice(1)} BLUEPRINT</h3>
          <p className="text-xs text-gray-300 font-mono">
            {blueprint.country} • {blueprint.totalArea?.toFixed(0) || 0} SQ FT • {blueprint.rooms?.length || 0} ROOMS
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-[#0a1f35] rounded-lg border border-gray-600">
            <button onClick={handleZoomOut} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-l-lg" title="Zoom Out">
              <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <span className="text-xs px-1 font-mono">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-r-lg" title="Zoom In">
              <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <button onClick={handleResetZoom} className="p-1.5 sm:p-2 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600 text-xs font-mono">
            Reset
          </button>
          
          <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600">
            {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
          
          <button onClick={onExportPDF} className="p-1.5 sm:p-2 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600" title="Export as PDF">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button onClick={handleCopyJSON} className="p-1.5 sm:p-2 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600" title="Copy JSON">
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="p-2 sm:p-4 overflow-auto bg-[#1a3a5c]" style={{ maxHeight: '80vh' }}>
        <div id="blueprint-canvas" className="border border-gray-600 rounded-lg overflow-auto bg-[#1a3a5c] shadow-xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={900}
            className="shadow-2xl"
            style={{ width: '100%', height: 'auto', maxWidth: '100%', display: 'block' }}
          />
        </div>
        
        <div className="mt-4 p-3 bg-[#0d2a45] rounded-lg border border-gray-600">
          <p className="text-xs sm:text-sm text-gray-300 font-mono">
            <strong className="text-yellow-400">PROFESSIONAL NOTE:</strong> This architectural drawing is for conceptual purposes. 
            All dimensions must be verified by a licensed professional engineer or architect prior to construction. 
            Scale: 1/4" = 1'-0"
          </p>
        </div>
      </div>
    </div>
  );
};