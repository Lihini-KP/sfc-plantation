'use client'

import { useState } from 'react'
import { NotebookPen, Sprout, Wheat, Wrench, Image as ImageIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { TunnelPhotosSection } from '@/components/tunnels/TunnelPhotosSection'
import { formatCurrency, formatDate } from '@/lib/format'
import type { GreenhousePlot } from '@/lib/mock-data/greenhouses'

const tabs = [
  { key: 'overview', label: 'Overview', icon: Sprout },
  { key: 'updates', label: 'Daily Updates', icon: NotebookPen },
  { key: 'planting', label: 'Planting Records', icon: Sprout },
  { key: 'harvests', label: 'Harvests', icon: Wheat },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'images', label: 'Images', icon: ImageIcon },
] as const

type TabKey = typeof tabs[number]['key']

export function TunnelDetailClient({ tunnel }: { tunnel: GreenhousePlot }) {
  const [tab, setTab] = useState<TabKey>('overview')
  const profit = tunnel.revenue - tunnel.totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium ${tab === t.key ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-brand-700/70 hover:bg-brand-50'}`}
            >
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Tunnel Details" subtitle="From the Annual Crop Plan sheet" />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
              <Field label="Current Crop" value={tunnel.cropName} />
              <Field label="Size" value={`${tunnel.sqft.toLocaleString()} sqft`} />
              <Field label="Planting Date" value={formatDate(tunnel.plantingDate)} />
              <Field label="First Harvest" value={formatDate(tunnel.firstHarvestDate)} />
              <Field label="Harvested Qty (range)" value={tunnel.harvestedQtyRange} />
              <Field label="Crop Removal Date" value={formatDate(tunnel.dateOfCropRemoval)} />
              <Field label="Next Crop Planting" value={formatDate(tunnel.nextCropPlantingDate)} full />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Financials" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-brand-700/60">Revenue</span>
                <span className="font-medium text-brand-800">{formatCurrency(tunnel.revenue)}</span>
              </div>
              {tunnel.expenses.map((e) => (
                <div key={e.label} className="flex items-center justify-between text-brand-700/60">
                  <span>{e.label}</span>
                  <span>{formatCurrency(e.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-brand-100 pt-2 font-medium text-brand-800">
                <span>Total Expenses</span>
                <span>{formatCurrency(tunnel.totalExpenses)}</span>
              </div>
              <div className={`mt-2 flex items-center justify-between rounded-xl p-2.5 ${profit >= 0 ? 'bg-status-healthy/10' : 'bg-status-critical/10'}`}>
                <span className={`flex items-center gap-1 font-semibold ${profit >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                  {profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {profit >= 0 ? 'Profit' : 'Loss'}
                </span>
                <span className={`font-semibold ${profit >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                  {formatCurrency(Math.abs(profit))}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'images' && <TunnelPhotosSection tunnelId={tunnel.id} tunnelName={tunnel.tunnel} cropName={tunnel.cropName} />}

      {tab !== 'overview' && tab !== 'images' && (
        <Card>
          <CardHeader title={tabs.find((t) => t.key === tab)?.label ?? ''} />
          <p className="py-8 text-center text-sm text-brand-700/40">
            No records yet - this module will be added here once real data is available.
          </p>
        </Card>
      )}
    </div>
  )
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-brand-700/50">{label}</dt>
      <dd className="text-brand-800">{value}</dd>
    </div>
  )
}
