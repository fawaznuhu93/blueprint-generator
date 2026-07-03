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
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 });

  // Calculate responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth - 32; // padding
      const aspectRatio = 1200 / 900;
      
      let newWidth = Math.min(containerWidth, 1200);
      let newHeight = newWidth / aspectRatio;
      
      // Ensure minimum sizes
      if (newWidth < 320) {
        newWidth = Math.min(containerWidth - 16, 1200);
        newHeight = newWidth / aspectRatio;
      }
      
      setCanvasSize({
        width: Math.max(newWidth, 300),
        height: Math.max(newHeight, 250)
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (canvasRef.current && blueprint?.rooms && blueprint.rooms.length > 0) {
      drawProfessionalBlueprint(canvasRef.current, blueprint, scale);
    }
  }, [blueprint, scale, canvasSize]);

  const drawProfessionalBlueprint = (canvas: HTMLCanvasElement, spec: BlueprintSpec, scaleValue: number = 1) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to responsive size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint background color (classic blue)
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint grid
    drawBlueprintGrid(ctx, canvas.width, canvas.height);
    
    // Safety check
    if (!spec.rooms || spec.rooms.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.min(16, canvas.width / 30)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('No rooms to display. Generate a blueprint first.', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    const gridSize = spec.unit === 'feet' ? 20 : 6;
    const padding = Math.min(canvas.width * 0.08, 80);
    const margin = Math.min(canvas.width * 0.08, 100);
    
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
    const availableHeight = canvas.height - margin * 2 - Math.min(120, canvas.height * 0.12);
    
    const fitScale = Math.min(availableWidth / totalWidth, availableHeight / totalHeight);
    const finalScale = fitScale * scaleValue;
    
    // Draw title block (scaled for mobile)
    drawTitleBlock(ctx, canvas.width, canvas.height, spec);
    
    // Draw north arrow
    drawNorthArrow(ctx, canvas.width - Math.min(80, canvas.width * 0.07), margin - 10);
    
    // Draw scale bar (scaled for mobile)
    drawScaleBar(ctx, canvas.width - Math.min(200, canvas.width * 0.2), canvas.height - Math.min(60, canvas.height * 0.06), spec.unit);
    
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
    
    // Draw legend (scaled for mobile)
    drawLegend(ctx, margin, canvas.height - Math.min(70, canvas.height * 0.08));
  };

  const drawBlueprintGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Major grid lines (every 40px)
    ctx.strokeStyle = '#2a5a8c';
    ctx.lineWidth = 0.5;
    
    const gridStep = Math.max(20, Math.min(40, width / 30));
    
    for (let x = 0; x <= width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Minor grid lines
    ctx.strokeStyle = '#1a4a7c';
    ctx.lineWidth = 0.3;
    const minorStep = gridStep / 4;
    
    for (let x = 0; x <= width; x += minorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += minorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D, room: Room, x: number, y: number, width: number, depth: number, unit: string, scale: number) => {
    if (!room || width < 2 || depth < 2) return;
    
    // Draw exterior walls (thicker)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, Math.min(4, width / 40));
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, depth);
    
    // Draw interior walls (thinner)
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = Math.max(1, Math.min(2, width / 60));
    ctx.strokeRect(x, y, width, depth);
    
    // Draw room label - responsive font size
    const fontSize = Math.max(8, Math.min(16, width / 12));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
      room.name?.toUpperCase() || 'ROOM',
      x + width / 2,
      y + depth / 2 - fontSize * 0.4
    );
    
    // Draw dimensions
    const dimFontSize = Math.max(7, Math.min(12, width / 18));
    ctx.font = `${dimFontSize}px "Courier New", monospace`;
    ctx.fillStyle = '#a0c0e0';
    ctx.fillText(
      `${room.width}' x ${room.depth}'`,
      x + width / 2,
      y + depth / 2 + fontSize * 0.5
    );
    
    // Draw area
    ctx.fillText(
      `${room.area} SF`,
      x + width / 2,
      y + depth / 2 + fontSize * 0.5 + dimFontSize + 2
    );
    
    // Draw doors
    if (room.doors && room.doors.length > 0) {
      room.doors.forEach(door => {
        drawDoorSymbol(ctx, x, y, width, depth, door);
      });
    }
    
    // Draw windows
    if (room.windows && room.windows.length > 0) {
      room.windows.forEach(window => {
        drawWindowSymbol(ctx, x, y, width, depth, window);
      });
    }
  };

  const drawDoorSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, door: any) => {
    if (!door) return;
    
    ctx.strokeStyle = '#e0a040';
    ctx.lineWidth = Math.max(1.5, Math.min(3, width / 50));
    ctx.fillStyle = '#e0a040';
    
    const doorWidth = Math.min(15, Math.max(8, width / 10));
    const doorSwingRadius = Math.min(20, Math.max(12, width / 8));
    
    switch(door.wall) {
      case 'south':
        const doorX = x + width * door.position;
        const doorY = y + depth;
        ctx.fillRect(doorX - 2, doorY - 2, 4, 4);
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorSwingRadius, 0, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorSwingRadius, doorY);
        ctx.stroke();
        break;
        
      case 'north':
        const doorXN = x + width * door.position;
        const doorYN = y;
        ctx.fillRect(doorXN - 2, doorYN - 2, 4, 4);
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
        ctx.fillRect(doorXE - 2, doorYE - 2, 4, 4);
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
        ctx.fillRect(doorXW - 2, doorYW - 2, 4, 4);
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
    if (!window) return;
    
    ctx.strokeStyle = '#60a0e0';
    ctx.lineWidth = Math.max(1.5, Math.min(3, width / 50));
    ctx.setLineDash([4, 4]);
    
    const windowWidth = Math.min(30, Math.max(15, width / 6));
    
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
    ctx.font = `${Math.min(10, Math.max(8, (rightX - leftX) / 60))}px "Courier New", monospace`;
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
    const blockX = 15;
    const blockY = height - Math.min(90, height * 0.1);
    const blockWidth = Math.min(280, width * 0.3);
    const blockHeight = Math.min(70, height * 0.08);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);
    
    ctx.beginPath();
    ctx.moveTo(blockX + Math.min(100, blockWidth * 0.35), blockY);
    ctx.lineTo(blockX + Math.min(100, blockWidth * 0.35), blockY + blockHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(blockX, blockY + blockHeight / 2);
    ctx.lineTo(blockX + blockWidth, blockY + blockHeight / 2);
    ctx.stroke();
    
    const titleSize = Math.min(11, Math.max(8, blockWidth / 25));
    const textSize = Math.min(8, Math.max(6, blockWidth / 35));
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleSize}px "Courier New", monospace`;
    ctx.fillText('BLUEPRINT PRO', blockX + 8, blockY + 18);
    
    ctx.font = `${textSize}px "Courier New", monospace`;
    ctx.fillText(`PROJECT: ${spec.buildingType.toUpperCase()}`, blockX + 8, blockY + 35);
    ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, blockX + 8, blockY + 52);
    
    ctx.fillText(`AREA: ${spec.totalArea.toFixed(0)} SF`, blockX + Math.min(105, blockWidth * 0.37) + 8, blockY + 18);
    ctx.fillText(`ROOMS: ${spec.rooms?.length || 0}`, blockX + Math.min(105, blockWidth * 0.37) + 8, blockY + 35);
    ctx.fillText(`SCALE: 1/4" = 1'-0"`, blockX + Math.min(105, blockWidth * 0.37) + 8, blockY + 52);
  };

  const drawNorthArrow = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    const fontSize = Math.min(12, Math.max(8, x / 10));
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y - 12);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y + 12);
    ctx.lineTo(x + 6, y + 12);
    ctx.closePath();
    ctx.fill();
  };

  const drawScaleBar = (ctx: CanvasRenderingContext2D, x: number, y: number, unit: string) => {
    const barWidth = Math.min(130, x * 0.15);
    const barHeight = 6;
    
    ctx.fillStyle = '#ffffff';
    const fontSize = Math.min(8, Math.max(6, barWidth / 16));
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, barWidth / 2, barHeight);
    ctx.fillStyle = '#2a5a8c';
    ctx.fillRect(x + barWidth / 2, y, barWidth / 2, barHeight);
    
    for (let i = 0; i <= 4; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (barWidth / 4) * i, y - 2, 1, barHeight + 4);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText('0', x, y + 16);
    ctx.fillText(`20${unit}`, x + barWidth / 2, y + 16);
    ctx.fillText(`40${unit}`, x + barWidth, y + 16);
    
    ctx.fillText('SCALE', x + barWidth / 2, y - 6);
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    const fontSize = Math.min(8, Math.max(6, x / 25));
    ctx.font = `${fontSize}px "Courier New", monospace`;
    
    const legendWidth = Math.min(160, x * 0.2);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(x, y - 4, legendWidth, Math.min(40, legendWidth * 0.25));
    
    ctx.fillText('LEGEND:', x + 5, y + fontSize + 2);
    
    // Door symbol
    ctx.fillStyle = '#e0a040';
    ctx.fillRect(x + Math.min(50, legendWidth * 0.35), y + 2, 6, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DOOR', x + Math.min(62, legendWidth * 0.4), y + fontSize + 2);
    
    // Window symbol
    ctx.strokeStyle = '#60a0e0';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x + Math.min(50, legendWidth * 0.35), y + fontSize + 6);
    ctx.lineTo(x + Math.min(56, legendWidth * 0.4), y + fontSize + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('WINDOW', x + Math.min(62, legendWidth * 0.4), y + fontSize + 12 + 2);
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
      <div className="bg-[#1a3a5c] rounded-xl border border-gray-600 p-6 sm:p-8 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Ruler className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-white text-sm sm:text-base">No Blueprint Available</h3>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">Generate a blueprint to see the visualization here.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a3a5c] rounded-xl border border-gray-600 overflow-hidden">
      <div className="bg-[#0d2a45] text-white p-2 sm:p-3 md:p-4 flex flex-wrap items-center justify-between gap-1 sm:gap-2 border-b border-gray-600">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm md:text-base font-mono truncate">
            {blueprint.buildingType?.charAt(0).toUpperCase() + blueprint.buildingType?.slice(1)} BLUEPRINT
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-300 font-mono truncate">
            {blueprint.country} • {blueprint.totalArea?.toFixed(0) || 0} SQ FT • {blueprint.rooms?.length || 0} ROOMS
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          <div className="flex items-center bg-[#0a1f35] rounded-lg border border-gray-600">
            <button onClick={handleZoomOut} className="p-1 sm:p-1.5 hover:bg-gray-700 rounded-l-lg" title="Zoom Out">
              <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[10px] sm:text-xs px-0.5 sm:px-1 font-mono">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1 sm:p-1.5 hover:bg-gray-700 rounded-r-lg" title="Zoom In">
              <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <button onClick={handleResetZoom} className="p-1 sm:p-1.5 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600 text-[10px] sm:text-xs font-mono">
            Reset
          </button>
          
          <button onClick={toggleFullscreen} className="p-1 sm:p-1.5 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600">
            {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
          
          <button onClick={onExportPDF} className="p-1 sm:p-1.5 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600" title="Export as PDF">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button onClick={handleCopyJSON} className="p-1 sm:p-1.5 bg-[#0a1f35] hover:bg-gray-700 rounded-lg border border-gray-600" title="Copy JSON">
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="p-2 sm:p-3 md:p-4 overflow-auto bg-[#1a3a5c]" style={{ maxHeight: '80vh' }}>
        <div 
          id="blueprint-canvas" 
          className="border border-gray-600 rounded-lg overflow-auto bg-[#1a3a5c] shadow-xl"
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            touchAction: 'pan-x pan-y'
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="shadow-2xl"
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '100%', 
              display: 'block',
              touchAction: 'none'
            }}
          />
        </div>
        
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-[#0d2a45] rounded-lg border border-gray-600">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-mono">
            <strong className="text-yellow-400">PROFESSIONAL NOTE:</strong> This architectural drawing is for conceptual purposes. 
            All dimensions must be verified by a licensed professional engineer or architect prior to construction. 
            Scale: 1/4" = 1'-0"
          </p>
        </div>
      </div>
    </div>
  );
};