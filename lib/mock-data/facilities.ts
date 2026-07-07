import type { FacilityPoint } from '@/lib/types'

export const facilities: FacilityPoint[] = [
  { id: 'facility-room', name: 'Facility Room', category: 'facility', description: 'Staff amenities building.', mapX: 0, mapY: 0, mapWidth: 10, mapHeight: 13 },
  { id: 'car-park', name: 'Car Park Tent', category: 'facility', description: 'Covered vehicle parking.', mapX: 10, mapY: 0, mapWidth: 20, mapHeight: 13 },
  { id: 'security-room', name: 'Security Room', category: 'facility', description: 'Estate entrance security post.', mapX: 30, mapY: 0, mapWidth: 16, mapHeight: 13 },
  { id: 'football-field', name: 'Football Field', category: 'facility', description: 'Staff recreation ground.', mapX: 0, mapY: 13, mapWidth: 16, mapHeight: 15 },
  { id: 'main-building', name: 'Main Building', category: 'facility', description: 'Administration and maintenance office.', mapX: 16, mapY: 13, mapWidth: 30, mapHeight: 33 },
  { id: 'solar-dryer-01', name: 'Solar Dryer 01', category: 'structure', description: 'Solar drying unit for harvested herbs.', mapX: 0, mapY: 28, mapWidth: 16, mapHeight: 18 },
  { id: 'tunnel-200ft', name: '200ft Tunnel', category: 'structure', description: 'Shade-net growing tunnel.', mapX: 33, mapY: 46, mapWidth: 7, mapHeight: 24 },
  { id: 'solar-dryer-02', name: 'Solar Dryer 02', category: 'structure', description: 'Solar drying unit for harvested herbs.', mapX: 40, mapY: 46, mapWidth: 6, mapHeight: 12 },
  { id: 'solar-dryer-03', name: 'Solar Dryer 03', category: 'structure', description: 'Solar drying unit for harvested herbs.', mapX: 40, mapY: 58, mapWidth: 6, mapHeight: 12 },
  { id: 'nursery', name: 'Nursery', category: 'structure', description: 'Seedling propagation area for all crops.', mapX: 20, mapY: 70, mapWidth: 8, mapHeight: 15 },
  { id: 'loom-house', name: 'Loom House', category: 'facility', description: 'Handicraft weaving unit.', mapX: 28, mapY: 70, mapWidth: 5, mapHeight: 15 },
  { id: 'container-3', name: 'Container 3', category: 'facility', description: 'Processing and cold storage container.', mapX: 33, mapY: 70, mapWidth: 7, mapHeight: 15 },
  { id: 'summer-hut', name: 'Summer Hut', category: 'facility', description: 'Staff rest area.', mapX: 40, mapY: 70, mapWidth: 6, mapHeight: 15 },
  { id: 'container-1', name: 'Container 1', category: 'facility', description: 'General storage container.', mapX: 0, mapY: 85, mapWidth: 15, mapHeight: 15 },
  { id: 'kitchen', name: 'Kitchen', category: 'facility', description: 'Staff kitchen and dining area.', mapX: 15, mapY: 85, mapWidth: 15, mapHeight: 15 },
  { id: 'container-2', name: 'Container 2', category: 'facility', description: 'General storage container.', mapX: 30, mapY: 85, mapWidth: 10, mapHeight: 15 },
  { id: 'small-animal-sheds', name: 'Small Animal Sheds', category: 'facility', description: 'Guinea pig house and rabbit house.', mapX: 40, mapY: 85, mapWidth: 6, mapHeight: 15 },
  { id: 'greenhouse-9600ft', name: '9600ft Tunnel', category: 'structure', description: 'Large greenhouse growing tunnel for potted seedlings.', mapX: 77, mapY: 32, mapWidth: 16, mapHeight: 14 },
  { id: 'compost-area', name: 'Compost Area', category: 'structure', description: 'Organic composting yard.', mapX: 93, mapY: 38, mapWidth: 7, mapHeight: 8 },
]
