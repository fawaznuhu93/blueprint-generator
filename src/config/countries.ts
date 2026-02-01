export const countries = [
  { code: 'US', name: 'United States', unit: 'feet' },
  { code: 'CA', name: 'Canada', unit: 'feet' },
  { code: 'GB', name: 'United Kingdom', unit: 'meters' },
  { code: 'AU', name: 'Australia', unit: 'meters' },
  { code: 'DE', name: 'Germany', unit: 'meters' },
  { code: 'JP', name: 'Japan', unit: 'meters' },
  { code: 'IN', name: 'India', unit: 'meters' },
  { code: 'MX', name: 'Mexico', unit: 'meters' }
];

export const countryDefaults: Record<string, any> = {
  US: {
    minRoomSizes: {
      bedroom: 120,
      living: 200,
      kitchen: 100,
      bathroom: 50,
      office: 100,
      storage: 80,
      dining: 150,
      hallway: 40,
      storefront: 300,
      reception: 120,
      workspace: 80,
      meeting: 150,
      break: 80
    },
    notes: 'Based on IRC 2021 minimums'
  },
  CA: {
    minRoomSizes: {
      bedroom: 110,
      living: 180,
      kitchen: 90,
      bathroom: 45,
      office: 90,
      storage: 70,
      dining: 140,
      hallway: 35,
      storefront: 280,
      reception: 110,
      workspace: 75,
      meeting: 140,
      break: 75
    },
    notes: 'Based on NBC 2020'
  },
  GB: {
    minRoomSizes: {
      bedroom: 11, // square meters
      living: 18,
      kitchen: 9,
      bathroom: 4,
      office: 9,
      storage: 7,
      dining: 14,
      hallway: 3,
      storefront: 28,
      reception: 11,
      workspace: 7,
      meeting: 14,
      break: 7
    },
    notes: 'Based on UK Building Regulations'
  },
  AU: {
    minRoomSizes: {
      bedroom: 12,
      living: 20,
      kitchen: 10,
      bathroom: 4,
      office: 10,
      storage: 8,
      dining: 15,
      hallway: 4,
      storefront: 30,
      reception: 12,
      workspace: 8,
      meeting: 15,
      break: 8
    },
    notes: 'Based on NCC 2022'
  },
  // Default fallback
  DEFAULT: {
    minRoomSizes: {
      bedroom: 100,
      living: 180,
      kitchen: 80,
      bathroom: 40,
      office: 80,
      storage: 60,
      dining: 120,
      hallway: 30,
      storefront: 250,
      reception: 100,
      workspace: 60,
      meeting: 120,
      break: 60
    },
    notes: 'International standards'
  }
};