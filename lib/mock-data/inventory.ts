import type { InventoryItem } from '@/lib/types'

export const inventory: InventoryItem[] = [
  { id: 'inv-1', name: 'NPK 15:15:15 Fertilizer', category: 'Fertilizer', stock: 340, unit: 'kg', reorderLevel: 200, lastStockIn: '2026-06-20', lastStockOut: '2026-07-03' },
  { id: 'inv-2', name: 'Neem Oil Concentrate', category: 'Pesticide', stock: 18, unit: 'L', reorderLevel: 20, lastStockIn: '2026-06-15', lastStockOut: '2026-07-05' },
  { id: 'inv-3', name: 'Copper Fungicide', category: 'Pesticide', stock: 6, unit: 'kg', reorderLevel: 10, lastStockIn: '2026-05-30', lastStockOut: '2026-07-06' },
  { id: 'inv-4', name: 'Vanilla Cuttings', category: 'Seed', stock: 120, unit: 'units', reorderLevel: 50, lastStockIn: '2026-04-10', lastStockOut: '2026-06-01' },
  { id: 'inv-5', name: 'Pruning Shears', category: 'Tool', stock: 14, unit: 'units', reorderLevel: 5, lastStockIn: '2026-03-01', lastStockOut: '2026-06-20' },
  { id: 'inv-6', name: 'Drip Irrigation Kit', category: 'Equipment', stock: 3, unit: 'sets', reorderLevel: 2, lastStockIn: '2026-02-14', lastStockOut: '2026-05-10' },
  { id: 'inv-7', name: 'Layer Mash Feed', category: 'Feed', stock: 1450, unit: 'kg', reorderLevel: 500, lastStockIn: '2026-06-28', lastStockOut: '2026-07-06' },
  { id: 'inv-8', name: 'Maize Mix Feed', category: 'Feed', stock: 380, unit: 'kg', reorderLevel: 400, lastStockIn: '2026-06-25', lastStockOut: '2026-07-06' },
  { id: 'inv-9', name: 'Newcastle Vaccine', category: 'Medicine', stock: 8, unit: 'vials', reorderLevel: 10, expiryDate: '2026-09-15', lastStockIn: '2026-05-01', lastStockOut: '2026-06-25' },
  { id: 'inv-10', name: 'Vitamin AD3E Supplement', category: 'Medicine', stock: 4, unit: 'bottles', reorderLevel: 5, expiryDate: '2026-08-01', lastStockIn: '2026-04-20', lastStockOut: '2026-07-02' },
]

export function lowStockItems() {
  return inventory.filter((i) => i.stock <= i.reorderLevel)
}
