// Professional Architectural Layout Engine
// Based on actual architectural principles

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

export class BlueprintEngine {
  private spec: BlueprintSpec;
  
  constructor(spec: BlueprintSpec) {
    this.spec = spec;
  }
  
  generateLayout(): Room[] {
    const rooms = [...this.spec.rooms];
    
    // Sort rooms by importance/function
    const sortedRooms = this.sortRoomsByPriority(rooms);
    
    // Choose layout strategy based on building type
    switch(this.spec.buildingType) {
      case 'house':
        return this.layoutHouse(sortedRooms);
      case 'office':
        return this.layoutOffice(sortedRooms);
      case 'shop':
        return this.layoutShop(sortedRooms);
      case 'restaurant':
        return this.layoutRestaurant(sortedRooms);
      default:
        return this.layoutGeneric(sortedRooms);
    }
  }
  
  private sortRoomsByPriority(rooms: Room[]): Room[] {
    // Priority: Public → Private → Service
    const priorityOrder: Record<RoomType, number> = {
      'living': 1, 'dining': 2, 'reception': 3, 'storefront': 4,
      'kitchen': 5, 'workspace': 6, 'meeting': 7, 'break': 8,
      'bedroom': 9, 'office': 10, 'bathroom': 11, 'storage': 12, 'hallway': 13
    };
    
    return [...rooms].sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
  }
  
  private layoutHouse(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    const gridSize = 5; // 5ft grid
    
    // Start with living room (center-left)
    const livingRoom = rooms.find(r => r.type === 'living');
    if (livingRoom) {
      livingRoom.position = { x: 10, y: 20 };
      layout.push(livingRoom);
    }
    
    // Kitchen adjacent to living room
    const kitchen = rooms.find(r => r.type === 'kitchen');
    if (kitchen) {
      kitchen.position = { x: livingRoom ? livingRoom.position.x + livingRoom.width + 5 : 10, y: 20 };
      layout.push(kitchen);
    }
    
    // Bedrooms on right side
    const bedrooms = rooms.filter(r => r.type === 'bedroom');
    let bedroomY = 20;
    bedrooms.forEach((bedroom, i) => {
      bedroom.position = { 
        x: 60 + (i % 2) * (bedroom.width + 5), 
        y: bedroomY 
      };
      if (i % 2 === 1) bedroomY += bedroom.depth + 5;
      layout.push(bedroom);
    });
    
    // Bathrooms near bedrooms
    const bathrooms = rooms.filter(r => r.type === 'bathroom');
    bathrooms.forEach((bathroom, i) => {
      bathroom.position = { 
        x: 55, 
        y: 25 + (i * 15) 
      };
      layout.push(bathroom);
    });
    
    // Add hallway connecting everything
    const hallway = rooms.find(r => r.type === 'hallway');
    if (hallway) {
      hallway.position = { x: 45, y: 20 };
      hallway.width = 5;
      hallway.depth = 40;
      hallway.area = hallway.width * hallway.depth;
      layout.push(hallway);
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutOffice(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    const gridSize = 5;
    
    // Reception at entrance
    const reception = rooms.find(r => r.type === 'reception');
    if (reception) {
      reception.position = { x: 10, y: 10 };
      layout.push(reception);
    }
    
    // Workspace in open area
    const workspace = rooms.find(r => r.type === 'workspace');
    if (workspace) {
      workspace.position = { x: 20, y: 10 };
      layout.push(workspace);
    }
    
    // Meeting rooms along one wall
    const meetings = rooms.filter(r => r.type === 'meeting');
    meetings.forEach((meeting, i) => {
      meeting.position = { x: 50, y: 10 + (i * 20) };
      layout.push(meeting);
    });
    
    // Break room
    const breakRoom = rooms.find(r => r.type === 'break');
    if (breakRoom) {
      breakRoom.position = { x: 70, y: 10 };
      layout.push(breakRoom);
    }
    
    // Bathrooms
    const bathrooms = rooms.filter(r => r.type === 'bathroom');
    bathrooms.forEach((bathroom, i) => {
      bathroom.position = { x: 70, y: 40 + (i * 15) };
      layout.push(bathroom);
    });
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutShop(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    
    // Storefront at front
    const storefront = rooms.find(r => r.type === 'storefront');
    if (storefront) {
      storefront.position = { x: 10, y: 10 };
      storefront.width = 40;
      storefront.depth = 30;
      storefront.area = storefront.width * storefront.depth;
      layout.push(storefront);
    }
    
    // Storage at back
    const storage = rooms.find(r => r.type === 'storage');
    if (storage) {
      storage.position = { x: 15, y: 45 };
      layout.push(storage);
    }
    
    // Office near front
    const office = rooms.find(r => r.type === 'office');
    if (office) {
      office.position = { x: 55, y: 10 };
      layout.push(office);
    }
    
    // Bathroom
    const bathroom = rooms.find(r => r.type === 'bathroom');
    if (bathroom) {
      bathroom.position = { x: 55, y: 30 };
      layout.push(bathroom);
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutRestaurant(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    
    // Dining area (large)
    const dining = rooms.find(r => r.type === 'dining');
    if (dining) {
      dining.position = { x: 10, y: 10 };
      dining.width = 50;
      dining.depth = 40;
      dining.area = dining.width * dining.depth;
      layout.push(dining);
    }
    
    // Kitchen at back
    const kitchen = rooms.find(r => r.type === 'kitchen');
    if (kitchen) {
      kitchen.position = { x: 15, y: 55 };
      layout.push(kitchen);
    }
    
    // Storage
    const storage = rooms.find(r => r.type === 'storage');
    if (storage) {
      storage.position = { x: 40, y: 55 };
      layout.push(storage);
    }
    
    // Bathrooms
    const bathrooms = rooms.filter(r => r.type === 'bathroom');
    bathrooms.forEach((bathroom, i) => {
      bathroom.position = { x: 65, y: 15 + (i * 20) };
      layout.push(bathroom);
    });
    
    // Office
    const office = rooms.find(r => r.type === 'office');
    if (office) {
      office.position = { x: 65, y: 55 };
      layout.push(office);
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutGeneric(rooms: Room[]): Room[] {
    // Simple grid layout as fallback
    const layout: Room[] = [];
    let x = 10, y = 10;
    let maxHeight = 0;
    
    rooms.forEach((room, i) => {
      room.position = { x, y };
      x += room.width + 5;
      maxHeight = Math.max(maxHeight, room.depth);
      
      if (x > 80) {
        x = 10;
        y += maxHeight + 5;
        maxHeight = 0;
      }
      
      layout.push(room);
    });
    
    return this.addDoorsAndWindows(layout);
  }
  
  private addDoorsAndWindows(rooms: Room[]): Room[] {
    return rooms.map(room => {
      const doors: typeof room.doors = [];
      const windows: typeof room.windows = [];
      
      // Add doors based on room type and position
      switch(room.type) {
        case 'living':
        case 'dining':
        case 'bedroom':
          doors.push({ wall: 'south', position: 0.5, width: 3 });
          windows.push(
            { wall: 'north', position: 0.3, width: 4 },
            { wall: 'north', position: 0.7, width: 4 }
          );
          break;
        case 'kitchen':
          doors.push({ wall: 'east', position: 0.5, width: 3 });
          windows.push({ wall: 'north', position: 0.5, width: 6 });
          break;
        case 'bathroom':
          doors.push({ wall: 'west', position: 0.5, width: 2.5 });
          windows.push({ wall: 'north', position: 0.8, width: 2 });
          break;
        case 'office':
        case 'meeting':
          doors.push({ wall: 'east', position: 0.5, width: 3 });
          windows.push({ wall: 'north', position: 0.5, width: 4 });
          break;
        case 'storefront':
          doors.push({ wall: 'south', position: 0.5, width: 6 });
          windows.push(
            { wall: 'south', position: 0.2, width: 8 },
            { wall: 'south', position: 0.8, width: 8 }
          );
          break;
      }
      
      return { ...room, doors, windows };
    });
  }
  
  calculateTotalArea(): number {
    return this.spec.rooms.reduce((sum, room) => sum + room.area, 0);
  }
  
  validateLayout(): string[] {
    const warnings: string[] = [];
    const minRoomSizes: Record<RoomType, number> = {
      'living': 150, 'kitchen': 80, 'bedroom': 120, 'bathroom': 35,
      'office': 100, 'storage': 60, 'dining': 140, 'hallway': 30,
      'storefront': 200, 'reception': 90, 'workspace': 70,
      'meeting': 120, 'break': 80
    };
    
    this.spec.rooms.forEach(room => {
      const minSize = minRoomSizes[room.type] || 70;
      if (room.area < minSize) {
        warnings.push(`${room.name} is below minimum size (${room.area} < ${minSize} sq ${this.spec.unit})`);
      }
      
      // Check for room overlaps (simplified)
      this.spec.rooms.forEach(otherRoom => {
        if (room.id !== otherRoom.id) {
          const roomRight = room.position.x + room.width;
          const roomBottom = room.position.y + room.depth;
          const otherRight = otherRoom.position.x + otherRoom.width;
          const otherBottom = otherRoom.position.y + otherRoom.depth;
          
          if (!(roomRight <= otherRoom.position.x || room.position.x >= otherRight ||
                roomBottom <= otherRoom.position.y || room.position.y >= otherBottom)) {
            warnings.push(`${room.name} overlaps with ${otherRoom.name}`);
          }
        }
      });
    });
    
    return warnings;
  }
}