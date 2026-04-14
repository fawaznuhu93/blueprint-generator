// Blueprint Generator Type Definitions
// This file exports all types needed for the application

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

export interface BlueprintSpec {
  buildingType: 'house' | 'shop' | 'office' | 'restaurant' | 'bungalow' | 'duplex' | 'apartment' | 'villa' | 'townhouse' | 'mansion';
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: 'linear' | 'central' | 'clustered' | 'open' | 'split' | 'compact' | 'spacious' | 'vertical' | 'estate';
  unit: 'feet' | 'meters';
  createdAt: string;
}

export interface UserInput {
  buildingType: 'house' | 'shop' | 'office' | 'restaurant' | 'bungalow' | 'duplex' | 'apartment' | 'villa' | 'townhouse' | 'mansion';
  country: string;
  professionalMode: boolean;
  customDimensions?: Record<string, { width: number; depth: number }>;
  roomCount?: {
    bedrooms: number;
    bathrooms: number;
    living: number;
    kitchen: number;
    office: number;
  };
}

// Default export for easier importing
export default { BlueprintSpec, Room, UserInput, RoomType };