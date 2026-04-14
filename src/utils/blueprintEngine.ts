// Blueprint Engine - Professional Layout Generator
// Types defined inline to avoid import issues

interface Room {
  id: string;
  name: string;
  type: string;
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

export class BlueprintEngine {
  private spec: BlueprintSpec;
  
  constructor(spec: BlueprintSpec) {
    this.spec = spec;
  }
  
  generateLayout(): Room[] {
    const rooms = [...this.spec.rooms];
    let currentX = 10;
    let currentY = 10;
    let maxHeight = 0;
    
    // Sort rooms by size (larger first for better layout)
    rooms.sort((a, b) => b.area - a.area);
    
    for (const room of rooms) {
      room.position = { x: currentX, y: currentY };
      
      // Add doors based on room type
      if (room.type !== 'hallway' && room.type !== 'bathroom') {
        room.doors = [{
          wall: 'south',
          position: 0.5,
          width: 3
        }];
      }
      
      // Add windows to exterior rooms
      if (['living', 'bedroom', 'dining', 'storefront', 'office'].includes(room.type)) {
        room.windows = [
          { wall: 'north', position: 0.3, width: 4 },
          { wall: 'north', position: 0.7, width: 4 }
        ];
      }
      
      currentX += room.width + 5;
      maxHeight = Math.max(maxHeight, room.depth);
      
      // New row if needed
      if (currentX > 60) {
        currentX = 10;
        currentY += maxHeight + 5;
        maxHeight = 0;
      }
    }
    
    return rooms;
  }
  
  calculateTotalArea(): number {
    return this.spec.rooms.reduce((sum, room) => sum + room.area, 0);
  }
  
  validateLayout(): string[] {
    const warnings: string[] = [];
    
    this.spec.rooms.forEach(room => {
      if (room.area < 70 && !['bathroom', 'hallway', 'storage'].includes(room.type)) {
        warnings.push(`${room.name} is very small (${room.area} sq ${this.spec.unit})`);
      }
    });
    
    // Check for room overlaps
    for (let i = 0; i < this.spec.rooms.length; i++) {
      for (let j = i + 1; j < this.spec.rooms.length; j++) {
        const a = this.spec.rooms[i];
        const b = this.spec.rooms[j];
        
        const overlap = !(a.position.x + a.width <= b.position.x ||
                         b.position.x + b.width <= a.position.x ||
                         a.position.y + a.depth <= b.position.y ||
                         b.position.y + b.depth <= a.position.y);
        
        if (overlap) {
          warnings.push(`${a.name} overlaps with ${b.name}`);
        }
      }
    }
    
    return warnings;
  }
}