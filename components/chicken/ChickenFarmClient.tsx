'use client'

import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Bird, Egg, Wheat, Syringe, HeartPulse, Clock } from 'lucide-react'
import { chickenBatches, eggLogs, feedLogs, vaccinations, healthRecords, chickenFarmStatus } from '@/lib/mock-data/chicken'
import { formatDate } from '@/lib/format'

const tabs = [
  { key: 'batches', label: 'Batches', icon: Bird },
  { key: 'eggs', label: 'Egg Production', icon: Egg },
  { key: 'feed', label: 'Feed Management', icon: Wheat },
  { key: 'vaccination', label: 'Vaccination & Medicine', icon: Syringe },
  { key: 'health', label: 'Health Monitoring', icon: HeartPulse },
] as const

type TabKey = typeof tabs[number]['key']

export function ChickenFarmClient() {
  const [tab, setTab] = useState<TabKey>('batches')

  return (
    <div className="space-y-6">
      <Card className="border-status-attention/30 bg-status-attention/5">
        <div className="flex items-start gap-3">
          <Clock size={20} className="mt-0.5 shrink-0 text-status-attention" />
          <div>
            <p className="text-sm font-semibold text-status-attention">Chicken farm not yet operational</p>
            <p className="mt-1 text-xs text-brand-700/70">
              {chickenFarmStatus.note} No batches, eggs, feed, vaccinations or health records exist yet - the tabs below will
              populate once the farm actually starts. Let us know the confirmed launch date to update this.
            </p>
          </div>
        </div>
      </Card>

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

      {tab === 'batches' && (
        <Card>
          <CardHeader title="Chicken Batches" />
          {chickenBatches.length === 0 ? (
            <EmptyState label="No batches recorded - farm not operational yet." />
          ) : (
            <Table
              headers={['Shed', 'Batch Code', 'Breed', 'Arrival', 'Age (wks)', 'Mortality', 'Current Stock']}
              rows={chickenBatches.map((b) => [b.shed, b.batchCode, b.breed, formatDate(b.arrivalDate), `${b.ageWeeks}`, `${b.mortality}`, `${b.currentStock}`])}
            />
          )}
        </Card>
      )}

      {tab === 'eggs' && (
        <Card>
          <CardHeader title="Daily Egg Production" />
          {eggLogs.length === 0 ? (
            <EmptyState label="No egg production yet - farm not operational." />
          ) : (
            <Table
              headers={['Date', 'Batch', 'Total', 'Damaged', 'Saleable', 'Sold']}
              rows={eggLogs.map((e) => {
                const batch = chickenBatches.find((b) => b.id === e.batchId)
                return [formatDate(e.date), batch?.batchCode || '', `${e.totalEggs}`, `${e.damagedEggs}`, `${e.saleableEggs}`, `${e.soldQuantity}`]
              })}
            />
          )}
        </Card>
      )}

      {tab === 'feed' && (
        <Card>
          <CardHeader title="Feed Management" />
          {feedLogs.length === 0 ? (
            <EmptyState label="No feed stock tracked yet - farm not operational." />
          ) : (
            <Table
              headers={['Feed Type', 'Daily Consumption', 'Remaining Stock', 'Days Left', 'Next Purchase']}
              rows={feedLogs.map((f) => [
                f.feedType,
                `${f.dailyConsumptionKg} kg`,
                `${f.remainingStockKg} kg`,
                `${Math.round(f.remainingStockKg / f.dailyConsumptionKg)} days`,
                formatDate(f.nextPurchaseDate),
              ])}
            />
          )}
        </Card>
      )}

      {tab === 'vaccination' && (
        <Card>
          <CardHeader title="Vaccination & Medicine Schedule" />
          {vaccinations.length === 0 ? (
            <EmptyState label="No vaccination schedule yet - farm not operational." />
          ) : (
            <Table
              headers={['Batch', 'Type', 'Name', 'Due Date', 'Status']}
              rows={vaccinations.map((v) => {
                const batch = chickenBatches.find((b) => b.id === v.batchId)
                return [batch?.batchCode || '', v.type, v.name, formatDate(v.dueDate), v.status]
              })}
              statusColIndex={4}
            />
          )}
        </Card>
      )}

      {tab === 'health' && (
        <Card>
          <CardHeader title="Chicken Health Monitoring" />
          {healthRecords.length === 0 ? (
            <EmptyState label="No health records yet - farm not operational." />
          ) : (
            <Table
              headers={['Batch', 'Date', 'Sick', 'Dead', 'Symptoms', 'Treatment', 'Recovery']}
              rows={healthRecords.map((h) => {
                const batch = chickenBatches.find((b) => b.id === h.batchId)
                return [batch?.batchCode || '', formatDate(h.date), `${h.sickBirds}`, `${h.deadBirds}`, h.symptoms, h.treatment, h.recovery]
              })}
            />
          )}
        </Card>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-brand-700/40">{label}</p>
}

function Table({ headers, rows, statusColIndex }: { headers: string[]; rows: string[][]; statusColIndex?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
            {headers.map((h) => <th key={h} className="pb-2 pr-4">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-brand-50 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-4 text-brand-700/80">
                  {j === statusColIndex ? <StatusPill status={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: 'bg-status-attention/10 text-status-attention',
    completed: 'bg-status-healthy/10 text-status-healthy',
    missed: 'bg-status-critical/10 text-status-critical',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] || ''}`}>{status}</span>
}
