// Blueprint Engine - Professional Building Layout Algorithm

interface Room {
  id: string;
  name: string;
  type: string;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: Array<any>;
  windows: Array<any>;
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
    
    // Sort rooms by importance for logical placement
    const sortedRooms = this.sortRoomsByImportance(rooms);
    
    // Use building-type specific layout
    switch(this.spec.buildingType) {
      case 'house':
      case 'bungalow':
        return this.layoutHouse(sortedRooms);
      case 'duplex':
        return this.layoutDuplex(sortedRooms);
      case 'apartment':
        return this.layoutApartment(sortedRooms);
      case 'villa':
        return this.layoutVilla(sortedRooms);
      case 'townhouse':
        return this.layoutTownhouse(sortedRooms);
      case 'mansion':
        return this.layoutMansion(sortedRooms);
      default:
        return this.layoutStandard(sortedRooms);
    }
  }
  
  private sortRoomsByImportance(rooms: Room[]): Room[] {
    const priority: Record<string, number> = {
      'living': 1,
      'kitchen': 2,
      'dining': 3,
      'master bedroom': 4,
      'bedroom': 5,
      'bathroom': 6,
      'hallway': 7,
      'office': 8,
      'storage': 9
    };
    
    return [...rooms].sort((a, b) => {
      const priorityA = priority[a.type.toLowerCase()] || 99;
      const priorityB = priority[b.type.toLowerCase()] || 99;
      return priorityA - priorityB;
    });
  }
  
  private layoutHouse(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    let livingRoom: Room | null = null;
    let kitchen: Room | null = null;
    let masterBedroom: Room | null = null;
    let otherBedrooms: Room[] = [];
    let bathrooms: Room[] = [];
    
    // Categorize rooms
    for (const room of rooms) {
      if (room.type === 'living') livingRoom = room;
      else if (room.type === 'kitchen') kitchen = room;
      else if (room.name?.toLowerCase().includes('master')) masterBedroom = room;
      else if (room.type === 'bedroom') otherBedrooms.push(room);
      else if (room.type === 'bathroom') bathrooms.push(room);
      else layout.push(room);
    }
    
    let currentY = 10;
    
    // Front of house - Living Room (Left side)
    if (livingRoom) {
      livingRoom.position = { x: 10, y: currentY };
      layout.push(livingRoom);
    }
    
    // Kitchen adjacent to living room (Right side)
    if (kitchen && livingRoom) {
      kitchen.position = { x: livingRoom.position.x + livingRoom.width + 5, y: currentY };
      layout.push(kitchen);
    } else if (kitchen) {
      kitchen.position = { x: livingRoom?.position.x || 10, y: currentY };
      layout.push(kitchen);
    }
    
    currentY += 35;
    
    // Hallway connecting front to back
    const hallway: Room = {
      id: 'hallway-main',
      name: 'Hallway',
      type: 'hallway',
      width: 5,
      depth: 30,
      area: 150,
      position: { x: livingRoom?.position.x || 10, y: currentY - 15 },
      color: '#94a3b8',
      doors: [],
      windows: []
    };
    layout.push(hallway);
    
    // Master Bedroom (Back right)
    if (masterBedroom) {
      masterBedroom.position = { x: 45, y: currentY };
      layout.push(masterBedroom);
      
      // Master bathroom attached
      const masterBath = bathrooms.find(b => b.name?.toLowerCase().includes('master'));
      if (masterBath) {
        masterBath.position = { x: masterBedroom.position.x + masterBedroom.width + 3, y: currentY };
        layout.push(masterBath);
      } else if (bathrooms.length > 0) {
        bathrooms[0].position = { x: masterBedroom.position.x + masterBedroom.width + 3, y: currentY };
        layout.push(bathrooms[0]);
        bathrooms.shift();
      }
    }
    
    currentY += 25;
    
    // Other bedrooms (Back left)
    for (let i = 0; i < otherBedrooms.length; i++) {
      const bedroom = otherBedrooms[i];
      bedroom.position = { x: 10, y: currentY + (i * 20) };
      layout.push(bedroom);
      
      // Attached bathroom for each bedroom
      if (bathrooms.length > 0) {
        const bath = bathrooms.shift();
        if (bath) {
          bath.position = { x: bedroom.position.x + bedroom.width + 3, y: bedroom.position.y };
          layout.push(bath);
        }
      }
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutDuplex(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    let currentX = 10;
    let currentY = 10;
    
    // Split into two identical units side by side
    const unitWidth = 45;
    
    for (let unit = 0; unit < 2; unit++) {
      const unitX = currentX + (unit * unitWidth);
      
      // Living area
      const living = rooms.find(r => r.type === 'living');
      if (living) {
        living.position = { x: unitX, y: currentY };
        layout.push({ ...living, id: `${living.id}-unit${unit + 1}` });
      }
      
      // Kitchen
      const kitchen = rooms.find(r => r.type === 'kitchen');
      if (kitchen) {
        kitchen.position = { x: unitX + 25, y: currentY };
        layout.push({ ...kitchen, id: `${kitchen.id}-unit${unit + 1}` });
      }
      
      // Bedrooms
      const bedrooms = rooms.filter(r => r.type === 'bedroom');
      for (let i = 0; i < Math.min(bedrooms.length, 2); i++) {
        const bedroom = bedrooms[i];
        bedroom.position = { x: unitX, y: currentY + 25 + (i * 18) };
        layout.push({ ...bedroom, id: `${bedroom.id}-unit${unit + 1}` });
      }
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutApartment(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    
    // Compact layout for apartments
    const living = rooms.find(r => r.type === 'living');
    const kitchen = rooms.find(r => r.type === 'kitchen');
    const bedrooms = rooms.filter(r => r.type === 'bedroom');
    
    if (living) {
      living.position = { x: 10, y: 10 };
      layout.push(living);
    }
    
    if (kitchen && living) {
      kitchen.position = { x: living.position.x + living.width + 3, y: 10 };
      layout.push(kitchen);
    }
    
    let bedY = 40;
    for (const bedroom of bedrooms) {
      bedroom.position = { x: 10, y: bedY };
      layout.push(bedroom);
      bedY += bedroom.depth + 5;
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutVilla(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    
    // Spacious villa layout with wings
    const living = rooms.find(r => r.type === 'living');
    const dining = rooms.find(r => r.type === 'dining');
    const kitchen = rooms.find(r => r.type === 'kitchen');
    const master = rooms.find(r => r.name?.toLowerCase().includes('master'));
    const bedrooms = rooms.filter(r => r.type === 'bedroom' && r !== master);
    
    if (living) {
      living.position = { x: 10, y: 10 };
      living.width = 30;
      living.depth = 25;
      layout.push(living);
    }
    
    if (dining && living) {
      dining.position = { x: living.position.x + living.width + 5, y: 10 };
      layout.push(dining);
    }
    
    if (kitchen && dining) {
      kitchen.position = { x: dining.position.x, y: dining.position.y + dining.depth + 5 };
      layout.push(kitchen);
    }
    
    if (master) {
      master.position = { x: 50, y: 10 };
      layout.push(master);
    }
    
    let bedY = 50;
    for (const bedroom of bedrooms) {
      bedroom.position = { x: 10, y: bedY };
      layout.push(bedroom);
      bedY += bedroom.depth + 5;
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutTownhouse(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    let currentY = 10;
    
    // Vertical layout for townhouse (stacked rooms)
    const living = rooms.find(r => r.type === 'living');
    const kitchen = rooms.find(r => r.type === 'kitchen');
    const bedrooms = rooms.filter(r => r.type === 'bedroom');
    
    if (living) {
      living.position = { x: 10, y: currentY };
      layout.push(living);
      currentY += living.depth + 5;
    }
    
    if (kitchen) {
      kitchen.position = { x: 10, y: currentY };
      layout.push(kitchen);
      currentY += kitchen.depth + 5;
    }
    
    for (const bedroom of bedrooms) {
      bedroom.position = { x: 10, y: currentY };
      layout.push(bedroom);
      currentY += bedroom.depth + 5;
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutMansion(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    
    // Grand mansion layout with multiple wings
    const living = rooms.find(r => r.type === 'living');
    const dining = rooms.find(r => r.type === 'dining');
    const kitchen = rooms.find(r => r.type === 'kitchen');
    const master = rooms.find(r => r.name?.toLowerCase().includes('master'));
    const bedrooms = rooms.filter(r => r.type === 'bedroom' && r !== master);
    const office = rooms.find(r => r.type === 'office');
    
    if (living) {
      living.position = { x: 10, y: 10 };
      living.width = 35;
      living.depth = 30;
      layout.push(living);
    }
    
    if (dining && living) {
      dining.position = { x: living.position.x + living.width + 5, y: 10 };
      layout.push(dining);
    }
    
    if (kitchen && dining) {
      kitchen.position = { x: dining.position.x, y: dining.position.y + dining.depth + 5 };
      layout.push(kitchen);
    }
    
    if (master) {
      master.position = { x: 55, y: 10 };
      master.width = 20;
      master.depth = 25;
      layout.push(master);
    }
    
    if (office) {
      office.position = { x: 55, y: master ? master.position.y + master.depth + 5 : 45 };
      layout.push(office);
    }
    
    let bedY = 50;
    for (const bedroom of bedrooms) {
      bedroom.position = { x: 10, y: bedY };
      layout.push(bedroom);
      bedY += bedroom.depth + 5;
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private layoutStandard(rooms: Room[]): Room[] {
    const layout: Room[] = [];
    let currentX = 10;
    let currentY = 10;
    let rowHeight = 0;
    
    for (const room of rooms) {
      room.position = { x: currentX, y: currentY };
      layout.push(room);
      
      currentX += room.width + 5;
      rowHeight = Math.max(rowHeight, room.depth);
      
      if (currentX > 70) {
        currentX = 10;
        currentY += rowHeight + 5;
        rowHeight = 0;
      }
    }
    
    return this.addDoorsAndWindows(layout);
  }
  
  private addDoorsAndWindows(rooms: Room[]): Room[] {
    return rooms.map(room => {
      const doors = [];
      const windows = [];
      
      // Add door on the wall that faces another room or hallway
      if (room.type !== 'hallway') {
        doors.push({ wall: 'south', position: 0.5, width: 3 });
      }
      
      // Add windows to exterior walls
      if (['living', 'bedroom', 'dining', 'kitchen'].includes(room.type)) {
        windows.push({ wall: 'north', position: 0.3, width: 4 });
        windows.push({ wall: 'north', position: 0.7, width: 4 });
      }
      
      return { ...room, doors, windows };
    });
  }
  
  calculateTotalArea(): number {
    if (!this.spec.rooms) return 0;
    return this.spec.rooms.reduce((sum, room) => sum + (room.width * room.depth), 0);
  }
  
  validateLayout(): string[] {
    const warnings: string[] = [];
    
    if (!this.spec.rooms || this.spec.rooms.length === 0) {
      warnings.push('No rooms found in blueprint');
      return warnings;
    }
    
    // Check for room overlaps
    for (let i = 0; i < this.spec.rooms.length; i++) {
      for (let j = i + 1; j < this.spec.rooms.length; j++) {
        const a = this.spec.rooms[i];
        const b = this.spec.rooms[j];
        
        if (a.position && b.position) {
          const overlap = !(a.position.x + a.width <= b.position.x ||
                           b.position.x + b.width <= a.position.x ||
                           a.position.y + a.depth <= b.position.y ||
                           b.position.y + b.depth <= a.position.y);
          
          if (overlap && a.type !== 'hallway' && b.type !== 'hallway') {
            warnings.push(`${a.name} overlaps with ${b.name}`);
          }
        }
      }
    }
    
    return warnings;
  }
}