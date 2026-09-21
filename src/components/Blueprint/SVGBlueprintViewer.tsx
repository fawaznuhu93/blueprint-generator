import { useState, useEffect } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import type { Room, BlueprintSpec } from '../../types/blueprint';

interface SVGBlueprintViewerProps {
  blueprint: BlueprintSpec;
}

export const SVGBlueprintViewer = ({ blueprint }: SVGBlueprintViewerProps) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');

  useEffect(() => {
    if (blueprint?.rooms?.length) {
      const svg = generateSVG(blueprint);
      setSvgContent(svg);

      const encoded = encodeURIComponent(svg)
        .replace(/%20/g, ' ')
        .replace(/%3D/g, '=')
        .replace(/%3A/g, ':')
        .replace(/%2F/g, '/');
      setSvgDataUrl(`data:image/svg+xml;charset=utf-8,${encoded}`);
    }
  }, [blueprint]);

  const generateSVG = (spec: BlueprintSpec): string => {
    const W = 1400;
    const H = 1000;
    const padding = 100;
    const titleBlockH = 90;

    const gridSize = spec.unit === 'feet' ? 20 : 6;
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

    spec.rooms.forEach(room => {
      const x = room.position.x * gridSize;
      const y = room.position.y * gridSize;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + room.width * gridSize);
      maxY = Math.max(maxY, y + room.depth * gridSize);
    });

    const totalW = maxX - minX || 1;
    const totalH = maxY - minY || 1;
    const availW = W - padding * 2;
    const availH = H - padding * 2 - titleBlockH;
    const fitScale = Math.min(availW / totalW, availH / totalH);
    const SCALE = fitScale;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

    svg += `<rect width="${W}" height="${H}" fill="#1a3a5c"/>`;

    svg += `<g stroke="#2a5580" stroke-width="0.5" opacity="0.4">`;
    for (let x = 0; x <= W; x += 20) {
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H - titleBlockH - 20}"/>`;
    }
    for (let y = 0; y <= H - titleBlockH - 20; y += 20) {
      svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    }
    svg += `</g>`;

    svg += `<g stroke="#3a6ea5" stroke-width="0.8" opacity="0.5">`;
    for (let x = 0; x <= W; x += 100) {
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H - titleBlockH - 20}"/>`;
    }
    for (let y = 0; y <= H - titleBlockH - 20; y += 100) {
      svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    }
    svg += `</g>`;

    spec.rooms.forEach(room => {
      const rx = (room.position.x * gridSize - minX) * SCALE + padding;
      const ry = (room.position.y * gridSize - minY) * SCALE + padding;
      const rw = room.width * gridSize * SCALE;
      const rh = room.depth * gridSize * SCALE;

      svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${room.color}" fill-opacity="0.15"/>`;
      svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="#ffffff" stroke-width="3"/>`;
      svg += `<rect x="${rx + 2}" y="${ry + 2}" width="${rw - 4}" height="${rh - 4}" fill="none" stroke="#7dd3fc" stroke-width="1" opacity="0.6"/>`;

      const fontSize = Math.max(10, Math.min(16, rw / 12));
      svg += `<text x="${rx + rw / 2}" y="${ry + rh / 2 - 12}" text-anchor="middle" font-family="'Courier New', monospace" font-size="${fontSize}" font-weight="bold" fill="#ffffff">${escapeXml(room.name.toUpperCase())}</text>`;

      const dimFont = Math.max(9, Math.min(12, rw / 16));
      svg += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 6}" text-anchor="middle" font-family="'Courier New', monospace" font-size="${dimFont}" fill="#93c5fd">${room.width}' × ${room.depth}'</text>`;

      svg += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 22}" text-anchor="middle" font-family="'Courier New', monospace" font-size="${dimFont - 1}" fill="#60a5fa">${room.area} SF</text>`;

      (room.doors || []).forEach((door: any) => {
        svg += drawDoorSVG(rx, ry, rw, rh, door);
      });

      (room.windows || []).forEach((win: any) => {
        svg += drawWindowSVG(rx, ry, rw, rh, win);
      });
    });

    const buildW = (maxX - minX) / gridSize;
    const buildD = (maxY - minY) / gridSize;

    const leftX = padding;
    const rightX = (maxX - minX) * SCALE + padding;
    const topY = padding;
    const bottomY = (maxY - minY) * SCALE + padding;

    svg += `<g stroke="#fbbf24" stroke-width="1" fill="#fbbf24" font-family="'Courier New', monospace" font-size="11">`;
    svg += `<line x1="${leftX}" y1="${topY - 25}" x2="${rightX}" y2="${topY - 25}" stroke-dasharray="4,4"/>`;
    svg += `<line x1="${leftX}" y1="${topY - 30}" x2="${leftX}" y2="${topY - 20}"/>`;
    svg += `<line x1="${rightX}" y1="${topY - 30}" x2="${rightX}" y2="${topY - 20}"/>`;
    svg += `<text x="${(leftX + rightX) / 2}" y="${topY - 32}" text-anchor="middle">${buildW.toFixed(1)}'</text>`;
    svg += `<line x1="${leftX - 25}" y1="${topY}" x2="${leftX - 25}" y2="${bottomY}" stroke-dasharray="4,4"/>`;
    svg += `<line x1="${leftX - 30}" y1="${topY}" x2="${leftX - 20}" y2="${topY}"/>`;
    svg += `<line x1="${leftX - 30}" y1="${bottomY}" x2="${leftX - 20}" y2="${bottomY}"/>`;
    svg += `<text x="${leftX - 40}" y="${(topY + bottomY) / 2}" text-anchor="middle" transform="rotate(-90 ${leftX - 40} ${(topY + bottomY) / 2})">${buildD.toFixed(1)}'</text>`;
    svg += `</g>`;

    svg += `<g transform="translate(${W - 70}, 70)">`;
    svg += `<circle r="28" fill="none" stroke="#ffffff" stroke-width="1.5"/>`;
    svg += `<path d="M 0,-22 L -8,8 L 0,0 L 8,8 Z" fill="#ffffff"/>`;
    svg += `<text x="0" y="-32" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#ffffff">N</text>`;
    svg += `</g>`;

    svg += `<g transform="translate(${W - 300}, ${H - titleBlockH - 40})">`;
    svg += `<text x="0" y="-8" font-family="'Courier New', monospace" font-size="9" fill="#ffffff">SCALE BAR</text>`;
    svg += `<rect x="0" y="0" width="60" height="8" fill="#ffffff"/>`;
    svg += `<rect x="60" y="0" width="60" height="8" fill="#1a3a5c" stroke="#ffffff" stroke-width="1"/>`;
    svg += `<text x="0" y="24" font-family="'Courier New', monospace" font-size="8" fill="#ffffff" text-anchor="middle">0</text>`;
    svg += `<text x="60" y="24" font-family="'Courier New', monospace" font-size="8" fill="#ffffff" text-anchor="middle">10ft</text>`;
    svg += `<text x="120" y="24" font-family="'Courier New', monospace" font-size="8" fill="#ffffff" text-anchor="middle">20ft</text>`;
    svg += `</g>`;

    const tbY = H - titleBlockH - 10;
    svg += `<rect x="20" y="${tbY}" width="450" height="${titleBlockH}" fill="#0d2a45" stroke="#ffffff" stroke-width="2"/>`;
    svg += `<line x1="220" y1="${tbY}" x2="220" y2="${tbY + titleBlockH}" stroke="#ffffff" stroke-width="1"/>`;
    svg += `<line x1="20" y1="${tbY + 45}" x2="470" y2="${tbY + 45}" stroke="#ffffff" stroke-width="1"/>`;

    svg += `<text x="30" y="${tbY + 22}" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#ffffff">BLUEPRINT GENERATOR</text>`;
    svg += `<text x="30" y="${tbY + 38}" font-family="'Courier New', monospace" font-size="10" fill="#93c5fd">AI-Powered Architectural Plans</text>`;

    svg += `<text x="30" y="${tbY + 62}" font-family="'Courier New', monospace" font-size="10" fill="#ffffff">PROJECT: ${escapeXml(spec.buildingType.toUpperCase())}</text>`;
    svg += `<text x="30" y="${tbY + 78}" font-family="'Courier New', monospace" font-size="10" fill="#ffffff">DATE: ${new Date(spec.createdAt).toLocaleDateString()}</text>`;

    svg += `<text x="235" y="${tbY + 22}" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#ffffff">SPECIFICATIONS</text>`;
    svg += `<text x="235" y="${tbY + 42}" font-family="'Courier New', monospace" font-size="9" fill="#93c5fd">TOTAL AREA: ${spec.totalArea.toFixed(0)} SF</text>`;
    svg += `<text x="235" y="${tbY + 58}" font-family="'Courier New', monospace" font-size="9" fill="#93c5fd">ROOMS: ${spec.rooms.length}</text>`;
    svg += `<text x="235" y="${tbY + 74}" font-family="'Courier New', monospace" font-size="9" fill="#93c5fd">SCALE: 1/4" = 1'-0"</text>`;

    svg += `</svg>`;
    return svg;
  };

  const drawDoorSVG = (rx: number, ry: number, rw: number, rh: number, door: any): string => {
    const doorRadius = 18;
    const color = '#fbbf24';
    let s = '';
    const doorX = rx + rw * (door.position || 0.5);

    switch (door.wall) {
      case 'south':
      case undefined:
        s += `<path d="M ${doorX} ${ry + rh} A ${doorRadius} ${doorRadius} 0 0 0 ${doorX + doorRadius} ${ry + rh - doorRadius}" fill="none" stroke="${color}" stroke-width="2"/>`;
        s += `<line x1="${doorX}" y1="${ry + rh}" x2="${doorX + doorRadius}" y2="${ry + rh}" stroke="${color}" stroke-width="2"/>`;
        break;
      case 'north':
        s += `<path d="M ${doorX} ${ry} A ${doorRadius} ${doorRadius} 0 0 0 ${doorX + doorRadius} ${ry + doorRadius}" fill="none" stroke="${color}" stroke-width="2"/>`;
        s += `<line x1="${doorX}" y1="${ry}" x2="${doorX + doorRadius}" y2="${ry}" stroke="${color}" stroke-width="2"/>`;
        break;
      case 'east':
        s += `<path d="M ${rx + rw} ${ry + rh * (door.position || 0.5)} A ${doorRadius} ${doorRadius} 0 0 0 ${rx + rw - doorRadius} ${ry + rh * (door.position || 0.5) + doorRadius}" fill="none" stroke="${color}" stroke-width="2"/>`;
        break;
      case 'west':
        s += `<path d="M ${rx} ${ry + rh * (door.position || 0.5)} A ${doorRadius} ${doorRadius} 0 0 0 ${rx + doorRadius} ${ry + rh * (door.position || 0.5) + doorRadius}" fill="none" stroke="${color}" stroke-width="2"/>`;
        break;
    }
    return s;
  };

  const drawWindowSVG = (rx: number, ry: number, rw: number, rh: number, win: any): string => {
    const winW = 30;
    const color = '#7dd3fc';
    let s = '';
    const winX = rx + rw * (win.position || 0.5);

    switch (win.wall) {
      case 'north':
        s += `<line x1="${winX - winW / 2}" y1="${ry}" x2="${winX + winW / 2}" y2="${ry}" stroke="${color}" stroke-width="4"/>`;
        break;
      case 'south':
        s += `<line x1="${winX - winW / 2}" y1="${ry + rh}" x2="${winX + winW / 2}" y2="${ry + rh}" stroke="${color}" stroke-width="4"/>`;
        break;
      case 'east':
        s += `<line x1="${rx + rw}" y1="${ry + rh * (win.position || 0.5) - winW / 2}" x2="${rx + rw}" y2="${ry + rh * (win.position || 0.5) + winW / 2}" stroke="${color}" stroke-width="4"/>`;
        break;
      case 'west':
        s += `<line x1="${rx}" y1="${ry + rh * (win.position || 0.5) - winW / 2}" x2="${rx}" y2="${ry + rh * (win.position || 0.5) + winW / 2}" stroke="${color}" stroke-width="4"/>`;
        break;
    }
    return s;
  };

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${blueprint.buildingType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgDataUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2800;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `blueprint-${blueprint.buildingType}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png', 1.0);
      }
    };
    img.src = svgDataUrl;
  };

  if (!blueprint?.rooms?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No blueprint data to render</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            AI-Generated Blueprint Image
          </h3>
          <p className="text-xs text-purple-200 truncate">
            {blueprint.buildingType} • {blueprint.country} • {blueprint.rooms.length} rooms
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSVG}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadPNG}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
            title="Download PNG"
          >
            PNG
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-lg flex items-center justify-center overflow-auto" style={{ minHeight: '500px' }}>
          <img
            src={svgDataUrl}
            alt="AI-generated blueprint"
            className="max-w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
          <p className="text-xs text-purple-200">
            <strong>AI-Generated Image:</strong> Rendered from AI-generated blueprint data as SVG vector graphics.
            Download as PNG for presentations or SVG for infinite-resolution scaling.
          </p>
        </div>
      </div>
    </div>
  );
};