export const countries = [
  { code: 'US', name: 'United States', unit: 'feet', flag: '🇺🇸' },
  { code: 'NG', name: 'Nigeria', unit: 'meters', flag: '🇳🇬' },
  { code: 'IN', name: 'India', unit: 'meters', flag: '🇮🇳' },
  { code: 'HK', name: 'Hong Kong', unit: 'meters', flag: '🇭🇰' },
  { code: 'AE', name: 'United Arab Emirates', unit: 'meters', flag: '🇦🇪' },
  { code: 'IE', name: 'Ireland', unit: 'meters', flag: '🇮🇪' },
  { code: 'MR', name: 'Mauritania', unit: 'meters', flag: '🇲🇷' },
  { code: 'SE', name: 'Sweden', unit: 'meters', flag: '🇸🇪' },
  { code: 'UG', name: 'Uganda', unit: 'meters', flag: '🇺🇬' },
  { code: 'GB', name: 'United Kingdom', unit: 'meters', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', unit: 'feet', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', unit: 'meters', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', unit: 'meters', flag: '🇩🇪' },
  { code: 'FR', name: 'France', unit: 'meters', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', unit: 'meters', flag: '🇯🇵' },
  { code: 'MX', name: 'Mexico', unit: 'meters', flag: '🇲🇽' }
];

export const countryDefaults: Record<string, any> = {
  US: {
    minRoomSizes: {
      bedroom: 120, living: 200, kitchen: 100, bathroom: 50,
      office: 100, storage: 80, dining: 150, hallway: 40,
      storefront: 300, reception: 120, workspace: 80,
      meeting: 150, break: 80
    },
    unit: 'feet',
    notes: 'Based on IRC 2021'
  },
  NG: {
    minRoomSizes: {
      bedroom: 110, living: 180, kitchen: 90, bathroom: 45,
      office: 90, storage: 70, dining: 140, hallway: 35,
      storefront: 280, reception: 110, workspace: 75,
      meeting: 140, break: 75
    },
    unit: 'meters',
    notes: 'Based on Nigerian Building Code'
  },
  HK: {
    minRoomSizes: {
      bedroom: 100, living: 160, kitchen: 80, bathroom: 40,
      office: 80, storage: 60, dining: 120, hallway: 30,
      storefront: 250, reception: 100, workspace: 70,
      meeting: 120, break: 70
    },
    unit: 'meters',
    notes: 'Hong Kong Building Standards'
  },
  AE: {
    minRoomSizes: {
      bedroom: 120, living: 200, kitchen: 100, bathroom: 50,
      office: 100, storage: 80, dining: 150, hallway: 40,
      storefront: 300, reception: 120, workspace: 80,
      meeting: 150, break: 80
    },
    unit: 'meters',
    notes: 'UAE Building Code'
  },
  IE: {
    minRoomSizes: {
      bedroom: 110, living: 180, kitchen: 90, bathroom: 45,
      office: 90, storage: 70, dining: 140, hallway: 35,
      storefront: 280, reception: 110, workspace: 75,
      meeting: 140, break: 75
    },
    unit: 'meters',
    notes: 'Irish Building Regulations'
  },
  MR: {
    minRoomSizes: {
      bedroom: 100, living: 160, kitchen: 80, bathroom: 40,
      office: 80, storage: 60, dining: 120, hallway: 30,
      storefront: 250, reception: 100, workspace: 70,
      meeting: 120, break: 70
    },
    unit: 'meters',
    notes: 'Mauritanian Standards'
  },
  SE: {
    minRoomSizes: {
      bedroom: 110, living: 180, kitchen: 90, bathroom: 45,
      office: 90, storage: 70, dining: 140, hallway: 35,
      storefront: 280, reception: 110, workspace: 75,
      meeting: 140, break: 75
    },
    unit: 'meters',
    notes: 'Swedish Building Code BBR'
  },
  UG: {
    minRoomSizes: {
      bedroom: 100, living: 160, kitchen: 80, bathroom: 40,
      office: 80, storage: 60, dining: 120, hallway: 30,
      storefront: 250, reception: 100, workspace: 70,
      meeting: 120, break: 70
    },
    unit: 'meters',
    notes: 'Uganda National Building Code'
  },
  GB: {
    minRoomSizes: {
      bedroom: 11, living: 18, kitchen: 9, bathroom: 4,
      office: 9, storage: 7, dining: 14, hallway: 3,
      storefront: 28, reception: 11, workspace: 7,
      meeting: 14, break: 7
    },
    unit: 'meters',
    notes: 'UK Building Regulations'
  },
  DEFAULT: {
    minRoomSizes: {
      bedroom: 100, living: 180, kitchen: 80, bathroom: 40,
      office: 80, storage: 60, dining: 120, hallway: 30,
      storefront: 250, reception: 100, workspace: 60,
      meeting: 120, break: 60
    },
    unit: 'meters',
    notes: 'International Standards'
  }
};