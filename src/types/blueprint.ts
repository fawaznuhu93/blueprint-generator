// Shared Blueprint Types
// Single source of truth for all blueprint types

export type RoomType =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'office'
  | 'storage'
  | 'dining'
  | 'hallway'
  | 'storefront'
  | 'reception'
  | 'workspace'
  | 'meeting'
  | 'break';

export interface Room {
  id: string;
  name: string;
  type: string;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: Array<{
    wall: 'north' | 'south' | 'east' | 'west' | string;
    position: number;
    width: number;
  }>;
  windows: Array<{
    wall: 'north' | 'south' | 'east' | 'west' | string;
    position: number;
    width: number;
  }>;
}

export interface BlueprintSpec {
  buildingType: string;
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: string;
  unit: 'feet' | 'meters';
  createdAt: string;
}

export interface BuildingData {
  buildingType: string;
  country?: string;
  bedrooms?: number;
  roomCount?: {
    bedrooms: number;
    bathrooms?: number;
    living?: number;
    kitchen?: number;
    office?: number;
  };
  guestToilet?: {
    hasGuestToilet: boolean;
    count: number;
  };
  landSize?: {
    width: number;
    depth: number;
    unit?: string;
  };
  description?: string;
  soilType?: string;
  nationality?: string;
}