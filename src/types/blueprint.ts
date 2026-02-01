// Type definitions for Blueprint Generator
// This file MUST export BlueprintSpec and Room

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
  buildingType: 'house' | 'shop' | 'office' | 'restaurant';
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: 'linear' | 'central' | 'clustered' | 'open';
  unit: 'feet' | 'meters';
  createdAt: string;
}

export interface UserInput {
  buildingType: 'house' | 'shop' | 'office' | 'restaurant';
  country: string;
  professionalMode: boolean;
  customDimensions?: Record<string, { width: number; depth: number }>;
}

// Explicitly export everything
export type { BlueprintSpec as BlueprintSpecType, Room as RoomType };