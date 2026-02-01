import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, Printer, Copy, ZoomIn, ZoomOut, Maximize2, Minus, Plus, Home, Building, MapPin, Ruler, Layers, Grid } from 'lucide-react';

// Types (keep as you have them)

interface BlueprintViewerProps {
  blueprint: BlueprintSpec;
  onExportPDF: () => void;
}

export const BlueprintViewer = ({ blueprint, onExportPDF }: BlueprintViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8); // Start with smaller scale
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Calculate optimal canvas size based on building dimensions
  const calculateOptimalCanvasSize = useCallback(() => {
    if (!blueprint?.rooms?.length) return { width: 1000, height: 800 };
    
    let maxX = 0, maxY = 0;
    const gridSize = blueprint.unit === 'feet' ? 12 : 4; // Smaller grid for better fit
    
    blueprint.rooms.forEach(room => {
      const x = room.position.x * gridSize + 40;
      const y = room.position.y * gridSize + 40;
      const right = x + room.width * gridSize;
      const bottom = y + room.depth * gridSize;
      
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });
    
    // Add margins for annotations, dimensions, etc.
    return {
      width: Math.min(maxX + 100, 1400), // Cap at 1400px
      height: Math.min(maxY + 100, 1000) // Cap at 1000px
    };
  }, [blueprint]);

  useEffect(() => {
    if (canvasRef.current && blueprint?.rooms?.length > 0) {
      const canvas = canvasRef.current;
      const optimalSize = calculateOptimalCanvasSize();
      
      // Set canvas size
      canvas.width = optimalSize.width;
      canvas.height = optimalSize.height;
      
      drawProfessionalBlueprint(canvas, blueprint, scale, panOffset);
    }
  }, [blueprint, scale, panOffset, calculateOptimalCanvasSize]);

  // Panning functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newScale = e.deltaY < 0 
      ? Math.min(scale + zoomFactor, 2.5) 
      : Math.max(scale - zoomFactor, 0.3);
    setScale(newScale);
  };

  const resetView = () => {
    setScale(0.8);
    setPanOffset({ x: 0, y: 0 });
  };

  const drawProfessionalBlueprint = (canvas: HTMLCanvasElement, spec: BlueprintSpec, scale: number = 0.8, offset: { x: number, y: number }) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with professional blueprint background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply scale and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw architectural grid (subtle)
    drawArchitecturalGrid(ctx, canvas.width / scale, canvas.height / scale, spec.unit);
    
    // Calculate building bounds for centering
    const buildingBounds = calculateBuildingBounds(spec.rooms, spec.unit);
    const centerX = (canvas.width / scale - buildingBounds.width) / 2 - buildingBounds.minX;
    const centerY = (canvas.height / scale - buildingBounds.height) / 2 - buildingBounds.minY;
    
    ctx.translate(centerX, centerY);
    
    // Draw building outline with foundation line
    drawBuildingOutline(ctx, spec, buildingBounds);
    
    // Draw each room with professional details
    spec.rooms.forEach(room => {
      drawArchitecturalRoom(ctx, room, spec.unit);
    });
    
    // Draw dimensions (aligned to grid)
    drawArchitecturalDimensions(ctx, spec.rooms, spec.unit);
    
    // Draw annotations last (on top)
    drawAnnotations(ctx, canvas.width / scale, canvas.height / scale, spec);
    
    ctx.restore();
  };

  const calculateBuildingBounds = (rooms: Room[], unit: string) => {
    const gridSize = unit === 'feet' ? 12 : 4;
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    
    rooms.forEach(room => {
      const x = room.position.x * gridSize;
      const y = room.position.y * gridSize;
      const right = x + room.width * gridSize;
      const bottom = y + room.depth * gridSize;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });
    
    // Add margins
    minX -= 20;
    minY -= 20;
    maxX += 20;
    maxY += 20;
    
    return {
      minX, minY, maxX, maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const drawArchitecturalGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, unit: string) => {
    const gridSize = unit === 'feet' ? 48 : 14.4; // 4ft/1.2m grid in pixels
    const minorGridSize = gridSize / 4; // 1ft/0.3m grid
    
    // Minor grid (very light)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.3;
    
    for (let x = 0; x <= width; x += minorGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += minorGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Major grid (4ft/1.2m)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Grid labels every 8ft/2.4m
    if (unit === 'feet') {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Courier New", monospace';
      ctx.textAlign = 'center';
      
      for (let x = gridSize * 2; x < width; x += gridSize * 2) {
        ctx.fillText(`${(x / gridSize * 4).toFixed(0)}'`, x, 15);
      }
      
      for (let y = gridSize * 2; y < height; y += gridSize * 2) {
        ctx.save();
        ctx.translate(15, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${(y / gridSize * 4).toFixed(0)}'`, 0, 0);
        ctx.restore();
      }
    }
  };

  const drawBuildingOutline = (ctx: CanvasRenderingContext2D, spec: BlueprintSpec, bounds: any) => {
    const gridSize = spec.unit === 'feet' ? 12 : 4;
    
    // Foundation line (dashed, outside)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(
      bounds.minX - 5,
      bounds.minY - 5,
      bounds.width + 10,
      bounds.height + 10
    );
    ctx.setLineDash([]);
    
    // Exterior walls (thick)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
    
    // Wall hatch pattern
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.strokeRect(bounds.minX + 1.5, bounds.minY + 1.5, bounds.width - 3, bounds.height - 3);
    ctx.setLineDash([]);
    
    // Draw north arrow (professional)
    drawNorthArrow(ctx, bounds.minX + 30, bounds.minY + 30);
    
    // Building label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px "Arial Narrow", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${spec.buildingType.toUpperCase()} PLAN - ${spec.country}`,
      bounds.minX + 50,
      bounds.minY - 10
    );
    
    // Scale notation
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(
      `SCALE: 1:100 (1/8" = 1'-0")`,
      bounds.maxX - 150,
      bounds.minY - 10
    );
  };

  const drawArchitecturalRoom = (ctx: CanvasRenderingContext2D, room: Room, unit: string) => {
    const gridSize = unit === 'feet' ? 12 : 4;
    
    const x = room.position.x * gridSize;
    const y = room.position.y * gridSize;
    const width = room.width * gridSize;
    const depth = room.depth * gridSize;
    
    // Room fill with subtle pattern based on type
    ctx.fillStyle = getRoomFillStyle(room.type);
    ctx.fillRect(x, y, width, depth);
    
    // Interior walls (medium weight)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, depth);
    
    // Wall center line (optional, for studs)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x + 0.75, y + 0.75, width - 1.5, depth - 1.5);
    ctx.setLineDash([]);
    
    // Draw doors with swing
    room.doors.forEach(door => {
      drawArchitecturalDoor(ctx, x, y, width, depth, door, gridSize);
    });
    
    // Draw windows with glass indication
    room.windows.forEach(window => {
      drawArchitecturalWindow(ctx, x, y, width, depth, window, gridSize);
    });
    
    // Room label box
    drawRoomLabel(ctx, x, y, width, depth, room, unit);
  };

  const getRoomFillStyle = (type: RoomType): string => {
    const styles: Record<RoomType, string> = {
      'living': 'rgba(254, 240, 138, 0.15)', // Light yellow
      'kitchen': 'rgba(187, 247, 208, 0.15)', // Light green
      'bedroom': 'rgba(219, 234, 254, 0.15)', // Light blue
      'bathroom': 'rgba(221, 214, 254, 0.15)', // Light purple
      'office': 'rgba(254, 226, 226, 0.15)', // Light red
      'storage': 'rgba(229, 231, 235, 0.15)', // Light gray
      'dining': 'rgba(254, 240, 138, 0.1)', // Very light yellow
      'hallway': 'rgba(241, 245, 249, 0.2)', // Very light gray
      'storefront': 'rgba(254, 215, 170, 0.15)', // Light orange
      'reception': 'rgba(186, 230, 253, 0.15)', // Light cyan
      'workspace': 'rgba(220, 252, 231, 0.1)', // Very light green
      'meeting': 'rgba(233, 213, 255, 0.1)', // Very light purple
      'break': 'rgba(254, 202, 202, 0.1)' // Very light pink
    };
    return styles[type] || 'rgba(241, 245, 249, 0.1)';
  };

  const drawArchitecturalDoor = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, door: any, gridSize: number) => {
    const doorWidth = door.width * gridSize;
    const doorPosition = door.position;
    
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#92400e';
    
    let doorX, doorY, swingStart, swingEnd;
    
    switch(door.wall) {
      case 'north':
        doorX = x + width * doorPosition;
        doorY = y;
        swingStart = Math.PI;
        swingEnd = Math.PI * 1.5;
        // Door line
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX, doorY + doorWidth);
        ctx.stroke();
        // Swing arc
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorWidth, swingStart, swingEnd);
        ctx.stroke();
        break;
        
      case 'south':
        doorX = x + width * doorPosition;
        doorY = y + depth;
        swingStart = 0;
        swingEnd = Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX, doorY - doorWidth);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorWidth, swingStart, swingEnd);
        ctx.stroke();
        break;
        
      case 'east':
        doorX = x + width;
        doorY = y + depth * doorPosition;
        swingStart = Math.PI * 0.5;
        swingEnd = Math.PI;
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX - doorWidth, doorY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorWidth, swingStart, swingEnd);
        ctx.stroke();
        break;
        
      case 'west':
        doorX = x;
        doorY = y + depth * doorPosition;
        swingStart = Math.PI * 1.5;
        swingEnd = Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorWidth, doorY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(doorX, doorY, doorWidth, swingStart, swingEnd);
        ctx.stroke();
        break;
    }
    
    // Door knob
    const knobRadius = 0.8;
    ctx.beginPath();
    ctx.arc(doorX, doorY, knobRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawArchitecturalWindow = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, window: any, gridSize: number) => {
    const windowWidth = window.width * gridSize;
    const windowCenter = window.position;
    
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
    
    let startX, startY, endX, endY;
    
    switch(window.wall) {
      case 'north':
        startX = x + width * windowCenter - windowWidth / 2;
        startY = y;
        endX = startX + windowWidth;
        endY = y;
        break;
        
      case 'south':
        startX = x + width * windowCenter - windowWidth / 2;
        startY = y + depth;
        endX = startX + windowWidth;
        endY = y + depth;
        break;
        
      case 'east':
        startX = x + width;
        startY = y + depth * windowCenter - windowWidth / 2;
        endX = x + width;
        endY = startY + windowWidth;
        break;
        
      case 'west':
        startX = x;
        startY = y + depth * windowCenter - windowWidth / 2;
        endX = x;
        endY = startY + windowWidth;
        break;
    }
    
    // Window glass area
    ctx.fillRect(startX, startY, endX - startX, endY - startY);
    
    // Window frame
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    
    // Window mullions (dividers)
    ctx.beginPath();
    ctx.moveTo((startX + endX) / 2, startY);
    ctx.lineTo((startX + endX) / 2, endY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(startX, (startY + endY) / 2);
    ctx.lineTo(endX, (startY + endY) / 2);
    ctx.stroke();
  };

  const drawRoomLabel = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, depth: number, room: Room, unit: string) => {
    const centerX = x + width / 2;
    const centerY = y + depth / 2;
    
    // Label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const labelWidth = Math.min(width * 0.8, 120);
    const labelHeight = 36;
    ctx.fillRect(
      centerX - labelWidth / 2,
      centerY - labelHeight / 2,
      labelWidth,
      labelHeight
    );
    
    // Label border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(
      centerX - labelWidth / 2,
      centerY - labelHeight / 2,
      labelWidth,
      labelHeight
    );
    
    // Room name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(room.name.toUpperCase(), centerX, centerY - 6);
    
    // Dimensions
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${room.width}' × ${room.depth}'`, centerX, centerY + 4);
    
    // Area
    ctx.fillText(`${room.area} SF`, centerX, centerY + 16);
  };

  const drawArchitecturalDimensions = (ctx: CanvasRenderingContext2D, rooms: Room[], unit: string) => {
    const gridSize = unit === 'feet' ? 12 : 4;
    
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 0.8;
    ctx.fillStyle = '#059669';
    ctx.font = '8px "Courier New", monospace';
    
    // For each room, draw dimensions
    rooms.forEach(room => {
      const x = room.position.x * gridSize;
      const y = room.position.y * gridSize;
      const width = room.width * gridSize;
      const depth = room.depth * gridSize;
      
      // Width dimension (bottom)
      const dimY = y + depth + 15;
      ctx.beginPath();
      ctx.moveTo(x, dimY);
      ctx.lineTo(x + width, dimY);
      // Extension lines
      ctx.moveTo(x, y + depth);
      ctx.lineTo(x, dimY);
      ctx.moveTo(x + width, y + depth);
      ctx.lineTo(x + width, dimY);
      // Arrowheads
      drawArrowhead(ctx, x, dimY, Math.PI / 2);
      drawArrowhead(ctx, x + width, dimY, -Math.PI / 2);
      ctx.stroke();
      
      // Dimension text
      ctx.fillText(`${room.width}'`, x + width / 2, dimY + 10);
      
      // Depth dimension (left)
      const dimX = x - 15;
      ctx.beginPath();
      ctx.moveTo(dimX, y);
      ctx.lineTo(dimX, y + depth);
      // Extension lines
      ctx.moveTo(x, y);
      ctx.lineTo(dimX, y);
      ctx.moveTo(x, y + depth);
      ctx.lineTo(dimX, y + depth);
      // Arrowheads
      drawArrowhead(ctx, dimX, y, 0);
      drawArrowhead(ctx, dimX, y + depth, Math.PI);
      ctx.stroke();
      
      // Depth text (rotated)
      ctx.save();
      ctx.translate(dimX - 10, y + depth / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${room.depth}'`, 0, 0);
      ctx.restore();
    });
  };

  const drawArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const size = 3;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size);
    ctx.stroke();
    ctx.restore();
  };

  const drawNorthArrow = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Professional north arrow
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y - 8);
    
    // Arrow with circle
    ctx.beginPath();
    ctx.arc(x, y + 15, 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Arrow inside circle
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x, y + 25);
    ctx.lineTo(x - 5, y + 20);
    ctx.moveTo(x, y + 25);
    ctx.lineTo(x + 5, y + 20);
    ctx.stroke();
  };

  const drawAnnotations = (ctx: CanvasRenderingContext2D, width: number, height: number, spec: BlueprintSpec) => {
    // Title block (professional)
    const titleBlockWidth = 200;
    const titleBlockHeight = 80;
    const titleX = width - titleBlockWidth - 20;
    const titleY = height - titleBlockHeight - 20;
    
    // Title block background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(titleX, titleY, titleBlockWidth, titleBlockHeight);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(titleX, titleY, titleBlockWidth, titleBlockHeight);
    
    // Title block content
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px "Arial Narrow", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ARCHITECTURAL PLAN', titleX + 10, titleY + 20);
    
    ctx.font = '10px "Arial Narrow", sans-serif';
    ctx.fillText(`Type: ${spec.buildingType.toUpperCase()}`, titleX + 10, titleY + 35);
    ctx.fillText(`Area: ${spec.totalArea.toFixed(0)} SF`, titleX + 10, titleY + 50);
    ctx.fillText(`Layout: ${spec.layout.toUpperCase()}`, titleX + 10, titleY + 65);
    
    // Drawing info
    ctx.font = '8px "Courier New", monospace';
    ctx.fillText(`Drawn: ${new Date(spec.createdAt).toLocaleDateString()}`, titleX + 110, titleY + 35);
    ctx.fillText(`Units: ${spec.unit}`, titleX + 110, titleY + 50);
    ctx.fillText(`Scale: 1/8" = 1'-0"`, titleX + 110, titleY + 65);
    
    // Legend in bottom left
    const legendX = 20;
    const legendY = height - 120;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX, legendY, 180, 100);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(legendX, legendY, 180, 100);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px "Arial Narrow", sans-serif';
    ctx.fillText('LEGEND', legendX + 10, legendY + 15);
    
    ctx.font = '9px "Arial Narrow", sans-serif';
    const legendItems = [
      { color: '#1e293b', label: 'Exterior Wall', lineWidth: 3 },
      { color: '#475569', label: 'Interior Wall', lineWidth: 1.5 },
      { color: '#92400e', label: 'Door', lineWidth: 1.5 },
      { color: '#0ea5e9', label: 'Window', lineWidth: 1 }
    ];
    
    legendItems.forEach((item, i) => {
      const itemY = legendY + 30 + i * 15;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.lineWidth;
      ctx.beginPath();
      ctx.moveTo(legendX + 10, itemY);
      ctx.lineTo(legendX + 30, itemY);
      ctx.stroke();
      
      ctx.fillStyle = '#475569';
      ctx.fillText(item.label, legendX + 40, itemY + 3);
    });
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2))
      .then(() => {
        alert('Blueprint JSON copied to clipboard!');
      });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-lg">Architectural Blueprint</h3>
            <p className="text-sm text-gray-300 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {blueprint.country} • {blueprint.totalArea.toFixed(0)} sq {blueprint.unit} • 
              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs">
                {blueprint.layout.toUpperCase()} LAYOUT
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg px-2 py-1">
            <button 
              onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
              className="p-1 hover:bg-gray-600 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-12 text-center">{(scale * 100).toFixed(0)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
              className="p-1 hover:bg-gray-600 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={resetView}
              className="p-1 hover:bg-gray-600 rounded ml-1"
              title="Reset View"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-600"></div>
          
          <button
            onClick={onExportPDF}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
            title="Export as PDF"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">PDF</span>
          </button>
          <button
            onClick={handleCopyJSON}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2"
            title="Copy JSON"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">JSON</span>
          </button>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div 
          ref={containerRef}
          className="overflow-auto p-4 bg-gray-50"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="inline-block p-4 bg-white border border-gray-300 rounded-lg shadow-inner">
            <canvas
              ref={canvasRef}
              className="bg-white"
              style={{ 
                display: 'block',
                cursor: isPanning ? 'grabbing' : 'grab'
              }}
            />
          </div>
        </div>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <Layers className="w-3 h-3" />
            <span>Drag to pan • Scroll to zoom</span>
          </div>
        </div>
        
        {/* Scale indicator */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <Ruler className="w-4 h-4 text-gray-700" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">Scale: 1/8" = 1'-0"</div>
              <div className="text-xs text-gray-600">1:{Math.round(100 / scale)} • {blueprint.unit === 'feet' ? 'Imperial' : 'Metric'}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-700">
                Rooms: <span className="font-semibold">{blueprint.rooms.length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Grid className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Grid: <span className="font-semibold">{blueprint.unit === 'feet' ? '4ft' : '1.2m'}</span>
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(blueprint.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};