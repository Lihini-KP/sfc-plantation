'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { inventory } from '@/lib/mock-data/inventory'
import { formatDate } from '@/lib/format'
import type { InventoryItem } from '@/lib/types'

const categories: (InventoryItem['category'] | 'All')[] = ['All', 'Fertilizer', 'Pesticide', 'Seed', 'Tool', 'Equipment', 'Feed', 'Medicine']

export function InventoryClient() {
  const [category, setCategory] = useState<(typeof categories)[number]>('All')

  const filtered = useMemo(
    () => (category === 'All' ? inventory : inventory.filter((i) => i.category === category)),
    [category]
  )
  const lowStock = inventory.filter((i) => i.stock <= i.reorderLevel)

  return (
    <div className="space-y-6">
      {lowStock.length > 0 && (
        <Card className="border-status-critical/30 bg-status-critical/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 text-status-critical" />
            <div>
              <p className="text-sm font-semibold text-status-critical">{lowStock.length} item(s) at or below reorder level</p>
              <p className="text-xs text-brand-700/60">{lowStock.map((i) => i.name).join(', ')}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${category === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-brand-700/70 hover:bg-brand-50'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="Inventory" subtitle={`${filtered.length} items`} />
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-brand-700/40">No inventory tracked yet - items will appear here once stock records are added.</p>
        )}
        {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
                <th className="pb-2 pr-4">Item</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Stock</th>
                <th className="pb-2 pr-4">Reorder Level</th>
                <th className="pb-2 pr-4">Expiry</th>
                <th className="pb-2 pr-4">Last Stock In</th>
                <th className="pb-2">Last Stock Out</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const low = item.stock <= item.reorderLevel
                return (
                  <tr key={item.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-brand-800">{item.name}</td>
                    <td className="py-2.5 pr-4 text-brand-700/70">{item.category}</td>
                    <td className={`py-2.5 pr-4 font-medium ${low ? 'text-status-critical' : 'text-brand-800'}`}>
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-2.5 pr-4 text-brand-700/70">{item.reorderLevel} {item.unit}</td>
                    <td className="py-2.5 pr-4 text-brand-700/70">{item.expiryDate ? formatDate(item.expiryDate) : '—'}</td>
                    <td className="py-2.5 pr-4 text-brand-700/70">{formatDate(item.lastStockIn)}</td>
                    <td className="py-2.5 text-brand-700/70">{formatDate(item.lastStockOut)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  )
}
