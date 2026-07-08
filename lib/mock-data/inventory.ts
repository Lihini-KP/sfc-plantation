import type { InventoryItem } from '@/lib/types'

// No real inventory tracking source connected yet (previous contents here
// were entirely invented, including feed stock for a chicken farm that
// isn't operational and a crop - Vanilla - that isn't grown on this estate).
// Left empty pending real stock records.
export const inventory: InventoryItem[] = []

export function lowStockItems() {
  return inventory.filter((i) => i.stock <= i.reorderLevel)
}
