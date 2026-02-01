// Average room sizes by building type (in sq ft/meters)
export const roomDefaults = {
  house: {
    living: { width: 16, depth: 20, area: 320 },
    kitchen: { width: 12, depth: 15, area: 180 },
    bedroom: { width: 14, depth: 16, area: 224 },
    bathroom: { width: 8, depth: 10, area: 80 },
    hallway: { width: 4, depth: 20, area: 80 }
  },
  shop: {
    storefront: { width: 30, depth: 40, area: 1200 },
    storage: { width: 15, depth: 20, area: 300 },
    office: { width: 12, depth: 12, area: 144 },
    bathroom: { width: 8, depth: 10, area: 80 }
  },
  office: {
    reception: { width: 20, depth: 15, area: 300 },
    workspace: { width: 25, depth: 30, area: 750 },
    meeting: { width: 15, depth: 20, area: 300 },
    break: { width: 12, depth: 15, area: 180 },
    bathroom: { width: 8, depth: 10, area: 80 }
  },
  restaurant: {
    dining: { width: 40, depth: 30, area: 1200 },
    kitchen: { width: 25, depth: 25, area: 625 },
    storage: { width: 15, depth: 15, area: 225 },
    bathroom: { width: 10, depth: 12, area: 120 },
    office: { width: 12, depth: 12, area: 144 }
  }
};