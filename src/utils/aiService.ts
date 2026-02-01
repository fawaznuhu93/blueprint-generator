import { roomDefaults } from '../config/roomDefaults';
import { countryDefaults } from '../config/countries';

// Define types inline
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
  buildingType: 'house' | 'shop' | 'office' | 'restaurant';
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: 'linear' | 'central' | 'clustered' | 'open';
  unit: 'feet' | 'meters';
  createdAt: string;
}

const convertIfNeeded = (value: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === 'meters' && toUnit === 'feet') {
    return value * 3.28084;
  }
  if (fromUnit === 'feet' && toUnit === 'meters') {
    return value * 0.3048;
  }
  return value;
};

const getColorForRoomType = (type: string): string => {
  const colors: Record<string, string> = {
    living: '#3b82f6',
    kitchen: '#f59e0b',
    bedroom: '#8b5cf6',
    bathroom: '#06b6d4',
    hallway: '#94a3b8',
    storefront: '#10b981',
    storage: '#64748b',
    office: '#6366f1',
    dining: '#ec4899',
    reception: '#14b8a6',
    workspace: '#0ea5e9',
    meeting: '#84cc16',
    break: '#f97316'
  };
  return colors[type] || '#6b7280';
};

export const generateBlueprintWithAI = async (
  buildingType: string,
  country: string,
  professionalMode: boolean = false
): Promise<BlueprintSpec> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const defaults = roomDefaults;
  const buildingDefaults = defaults[buildingType as keyof typeof defaults] || defaults.house;
  const unit = country === 'US' || country === 'CA' ? 'feet' : 'meters';
  
  const countryData = countryDefaults[country] || countryDefaults.DEFAULT;
  
  const rooms: Room[] = Object.entries(buildingDefaults).map(([name, defaultSize], index) => {
    const minArea = countryData.minRoomSizes[name as keyof typeof countryData.minRoomSizes] || 0;
    
    let finalWidth = defaultSize.width;
    let finalDepth = defaultSize.depth;
    
    if (minArea > 0) {
      const currentArea = defaultSize.width * defaultSize.depth;
      if (currentArea < minArea) {
        const scaleFactor = Math.sqrt(minArea / currentArea);
        finalWidth = defaultSize.width * scaleFactor;
        finalDepth = defaultSize.depth * scaleFactor;
      }
    }
    
    if (unit !== 'feet') {
      finalWidth = convertIfNeeded(finalWidth, 'feet', unit);
      finalDepth = convertIfNeeded(finalDepth, 'feet', unit);
    }
    
    return {
      id: `room-${index}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      type: name as any,
      width: Math.round(finalWidth * 10) / 10,
      depth: Math.round(finalDepth * 10) / 10,
      area: Math.round(finalWidth * finalDepth * 10) / 10,
      position: { x: index * 25, y: 0 },
      color: getColorForRoomType(name),
      doors: [],
      windows: []
    };
  });
  
  const totalWidth = rooms.reduce((sum, room) => sum + room.width, 0) * 1.5;
  const totalDepth = rooms.reduce((max, room) => Math.max(max, room.depth), 0) * 1.5;
  
  const blueprint: BlueprintSpec = {
    buildingType: buildingType as any,
    country,
    totalArea: rooms.reduce((sum, room) => sum + room.area, 0),
    dimensions: { 
      width: Math.round(totalWidth * 10) / 10,
      depth: Math.round(totalDepth * 10) / 10
    },
    rooms,
    layout: 'linear',
    unit,
    createdAt: new Date().toISOString()
  };
  
  return blueprint;
};