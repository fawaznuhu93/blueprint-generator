// Template-based Blueprint Generation - No API Required

import { roomDefaults } from '../config/roomDefaults';
import { BlueprintEngine } from './blueprintEngine';

export const generateBlueprintWithAI = async (
  buildingType: string,
  country: string,
  professionalMode: boolean = false,
  roomCount?: any,
  landSize?: any,
  description?: string,
  guestToilet?: any,
  customizations?: any
): Promise<any> => {
  
  console.log('🏗️ Generating blueprint using template system...');
  
  // Simulate processing delay (feels more professional)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get template based on building type
  const template = getTemplateForBuildingType(buildingType, roomCount, landSize, guestToilet);
  
  // Apply professional customizations if provided
  const finalRooms = applyCustomizations(template.rooms, customizations);
  
  // Calculate total area
  const totalArea = finalRooms.reduce((sum: number, room: any) => sum + (room.width * room.depth), 0);
  
  // Determine unit based on country
  const unit = country === 'US' || country === 'CA' ? 'feet' : 'meters';
  
  // Apply deterministic layout
  const engine = new BlueprintEngine({
    buildingType,
    country,
    totalArea,
    dimensions: { width: landSize?.width || 60, depth: landSize?.depth || 50 },
    rooms: finalRooms,
    layout: 'professional',
    unit,
    createdAt: new Date().toISOString()
  });
  
  const laidOutRooms = engine.generateLayout();
  
  return {
    buildingType,
    country,
    totalArea: Math.round(totalArea * 10) / 10,
    dimensions: { 
      width: Math.round((landSize?.width || 60) * 0.9), 
      depth: Math.round((landSize?.depth || 50) * 0.9) 
    },
    rooms: laidOutRooms,
    layout: 'professional',
    unit,
    createdAt: new Date().toISOString()
  };
};

// Get template based on building type
function getTemplateForBuildingType(buildingType: string, roomCount?: any, landSize?: any, guestToilet?: any) {
  const bedrooms = roomCount?.bedrooms || 3;
  
  const templates: Record<string, any> = {
    bungalow: {
      rooms: [
        { name: 'Living Room', type: 'living', width: 16, depth: 20 },
        { name: 'Kitchen', type: 'kitchen', width: 12, depth: 15 },
        { name: 'Dining Area', type: 'dining', width: 12, depth: 14 },
        { name: 'Master Bedroom', type: 'bedroom', width: 14, depth: 16 },
        { name: 'Master Bathroom', type: 'bathroom', width: 8, depth: 10 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 12,
          depth: 12
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 6,
          depth: 8
        })),
        { name: 'Hallway', type: 'hallway', width: 4, depth: 20 }
      ]
    },
    duplex: {
      rooms: [
        { name: 'Living Room', type: 'living', width: 18, depth: 22 },
        { name: 'Kitchen', type: 'kitchen', width: 14, depth: 16 },
        { name: 'Dining Area', type: 'dining', width: 14, depth: 16 },
        { name: 'Master Bedroom', type: 'bedroom', width: 16, depth: 18 },
        { name: 'Master Bathroom', type: 'bathroom', width: 10, depth: 12 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 13,
          depth: 14
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 7,
          depth: 9
        })),
        { name: 'Office', type: 'office', width: 10, depth: 12 },
        { name: 'Hallway', type: 'hallway', width: 5, depth: 25 }
      ]
    },
    apartment: {
      rooms: [
        { name: 'Living Room', type: 'living', width: 14, depth: 18 },
        { name: 'Kitchen', type: 'kitchen', width: 10, depth: 12 },
        { name: 'Dining Area', type: 'dining', width: 10, depth: 12 },
        { name: 'Master Bedroom', type: 'bedroom', width: 12, depth: 14 },
        { name: 'Master Bathroom', type: 'bathroom', width: 6, depth: 8 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 10,
          depth: 12
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 5,
          depth: 7
        })),
        { name: 'Hallway', type: 'hallway', width: 3, depth: 15 }
      ]
    },
    villa: {
      rooms: [
        { name: 'Grand Living Room', type: 'living', width: 20, depth: 25 },
        { name: 'Gourmet Kitchen', type: 'kitchen', width: 16, depth: 18 },
        { name: 'Formal Dining', type: 'dining', width: 16, depth: 18 },
        { name: 'Master Suite', type: 'bedroom', width: 18, depth: 20 },
        { name: 'Master Bathroom', type: 'bathroom', width: 12, depth: 14 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Guest Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 14,
          depth: 15
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Guest Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 8,
          depth: 10
        })),
        { name: 'Home Office', type: 'office', width: 12, depth: 14 },
        { name: 'Library', type: 'office', width: 12, depth: 12 },
        { name: 'Hallway', type: 'hallway', width: 6, depth: 30 }
      ]
    },
    townhouse: {
      rooms: [
        { name: 'Living Room', type: 'living', width: 14, depth: 20 },
        { name: 'Kitchen', type: 'kitchen', width: 12, depth: 14 },
        { name: 'Dining Area', type: 'dining', width: 12, depth: 14 },
        { name: 'Master Bedroom', type: 'bedroom', width: 14, depth: 16 },
        { name: 'Master Bathroom', type: 'bathroom', width: 8, depth: 10 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 11,
          depth: 12
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 6,
          depth: 8
        })),
        { name: 'Hallway', type: 'hallway', width: 3, depth: 20 }
      ]
    },
    mansion: {
      rooms: [
        { name: 'Grand Hall', type: 'living', width: 25, depth: 30 },
        { name: 'Commercial Kitchen', type: 'kitchen', width: 20, depth: 22 },
        { name: 'Formal Dining', type: 'dining', width: 20, depth: 22 },
        { name: 'Master Wing', type: 'bedroom', width: 20, depth: 25 },
        { name: 'Master Bathroom', type: 'bathroom', width: 15, depth: 18 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Suite ${i + 2}`,
          type: 'bedroom',
          width: 16,
          depth: 18
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Ensuite ${i + 2}`,
          type: 'bathroom',
          width: 10,
          depth: 12
        })),
        { name: 'Home Theater', type: 'living', width: 15, depth: 20 },
        { name: 'Indoor Pool', type: 'living', width: 30, depth: 40 },
        { name: 'Gym', type: 'office', width: 15, depth: 20 },
        { name: 'Wine Cellar', type: 'storage', width: 10, depth: 15 }
      ]
    },
    // Default fallback
    house: {
      rooms: [
        { name: 'Living Room', type: 'living', width: 16, depth: 20 },
        { name: 'Kitchen', type: 'kitchen', width: 12, depth: 15 },
        { name: 'Dining Area', type: 'dining', width: 12, depth: 14 },
        { name: 'Master Bedroom', type: 'bedroom', width: 14, depth: 16 },
        { name: 'Master Bathroom', type: 'bathroom', width: 8, depth: 10 },
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bedroom ${i + 2}`,
          type: 'bedroom',
          width: 12,
          depth: 12
        })),
        ...Array(bedrooms - 1).fill(null).map((_, i) => ({
          name: `Bathroom ${i + 2}`,
          type: 'bathroom',
          width: 6,
          depth: 8
        })),
        { name: 'Hallway', type: 'hallway', width: 4, depth: 20 }
      ]
    }
  };
  
  let template = templates[buildingType] || templates.house;
  
  // Add guest toilet if requested
  if (guestToilet?.hasGuestToilet) {
    for (let i = 0; i < (guestToilet.count || 1); i++) {
      template.rooms.push({
        name: i === 0 ? 'Guest Toilet' : `Guest Toilet ${i + 1}`,
        type: 'bathroom',
        width: 5,
        depth: 7
      });
    }
  }
  
  return template;
}

// Apply customizations from professional mode
function applyCustomizations(rooms: any[], customizations: any) {
  if (!customizations?.roomSizes || Object.keys(customizations.roomSizes).length === 0) {
    return rooms;
  }
  
  return rooms.map(room => {
    const roomKey = room.name.toLowerCase().replace(/\s/g, '');
    const customSize = customizations.roomSizes[roomKey] || 
                       customizations.roomSizes[room.type] ||
                       customizations.roomSizes[room.name];
    
    if (customSize) {
      return {
        ...room,
        width: customSize.width || room.width,
        depth: customSize.depth || room.depth,
        area: (customSize.width || room.width) * (customSize.depth || room.depth)
      };
    }
    return room;
  });
}