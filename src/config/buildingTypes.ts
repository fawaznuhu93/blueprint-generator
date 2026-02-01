export const buildingTypes = [
  {
    id: 'house',
    name: 'House',
    description: 'Residential home',
    icon: '🏠',
    defaultArea: 2000, // sq ft
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'hallway'],
    typicalLayout: 'clustered' as const
  },
  {
    id: 'shop',
    name: 'Retail Shop',
    description: 'Small retail store',
    icon: '🛍️',
    defaultArea: 1500,
    defaultRooms: ['storefront', 'storage', 'office', 'bathroom'],
    typicalLayout: 'linear' as const
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Professional workspace',
    icon: '🏢',
    defaultArea: 2500,
    defaultRooms: ['reception', 'workspace', 'meeting', 'break', 'bathroom'],
    typicalLayout: 'open' as const
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Food service establishment',
    icon: '🍽️',
    defaultArea: 3000,
    defaultRooms: ['dining', 'kitchen', 'storage', 'bathroom', 'office'],
    typicalLayout: 'central' as const
  }
];

export type BuildingType = typeof buildingTypes[number]['id'];