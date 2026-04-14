export const buildingTypes = [
  {
    id: 'bungalow',
    name: 'Bungalow',
    description: 'Single-story house',
    icon: '🏠',
    defaultArea: 1500,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'hallway'],
    typicalLayout: 'clustered'
  },
  {
    id: 'duplex',
    name: 'Duplex',
    description: 'Two-family house',
    icon: '🏘️',
    defaultArea: 2500,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'dining', 'hallway'],
    typicalLayout: 'split'
  },
  {
    id: 'apartment',
    name: 'Apartment',
    description: 'Multi-unit residential',
    icon: '🏢',
    defaultArea: 1200,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'hallway'],
    typicalLayout: 'compact'
  },
  {
    id: 'villa',
    name: 'Villa',
    description: 'Luxury detached home',
    icon: '🏰',
    defaultArea: 4000,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'dining', 'office', 'garden', 'garage'],
    typicalLayout: 'spacious'
  },
  {
    id: 'townhouse',
    name: 'Townhouse',
    description: 'Row house with multiple floors',
    icon: '🏘️',
    defaultArea: 2000,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'dining', 'hallway'],
    typicalLayout: 'vertical'
  },
  {
    id: 'mansion',
    name: 'Mansion',
    description: 'Large luxury estate',
    icon: '🏛️',
    defaultArea: 8000,
    defaultRooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'dining', 'office', 'library', 'gym', 'theater'],
    typicalLayout: 'estate'
  },
  {
    id: 'shop',
    name: 'Retail Shop',
    description: 'Small retail store',
    icon: '🛍️',
    defaultArea: 1500,
    defaultRooms: ['storefront', 'storage', 'office', 'bathroom'],
    typicalLayout: 'linear'
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Professional workspace',
    icon: '🏢',
    defaultArea: 2500,
    defaultRooms: ['reception', 'workspace', 'meeting', 'break', 'bathroom'],
    typicalLayout: 'open'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Food service establishment',
    icon: '🍽️',
    defaultArea: 3000,
    defaultRooms: ['dining', 'kitchen', 'storage', 'bathroom', 'office'],
    typicalLayout: 'central'
  }
];

export type BuildingType = typeof buildingTypes[number]['id'];