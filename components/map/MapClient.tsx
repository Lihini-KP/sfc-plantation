'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, Sparkles, Building2, Pencil } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { HealthBadge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ProgressBar'
import { areas as baseAreas } from '@/lib/mock-data/areas'
import { facilities } from '@/lib/mock-data/facilities'
import { crops } from '@/lib/mock-data/crops'
import { cropSales } from '@/lib/mock-data/cropSales'
import { getAnalysisForArea } from '@/lib/mock-data/aiInsights'
import { formatDate, formatCurrency } from '@/lib/format'
import type { HealthStatus, PlantationArea } from '@/lib/types'

const STORAGE_KEY = 'sfc-area-overrides'

type EditableFields = Pick<
  PlantationArea,
  | 'plantCount'
  | 'variety'
  | 'growthStage'
  | 'healthStatus'
  | 'plantingDate'
  | 'expectedHarvestDate'
  | 'lastInspection'
  | 'irrigationMethod'
  | 'fertilizerSchedule'
  | 'diseaseStatus'
  | 'pestStatus'
  | 'assignedStaff'
>

const zoneBorder: Record<HealthStatus, string> = {
  healthy: '#15803d',
  attention: '#d4a72c',
  moderate: '#e07b2c',
  critical: '#dc2626',
}

const CROP_ICON: Record<string, string> = {
  'crop-hibiscus': '🌺',
  'crop-gurmar': '🍃',
  'crop-papaya': '🌴',
  'crop-mango': '🥭',
  'crop-soursop-ginger': '🍈',
  'crop-roses': '🌹',
  'crop-coffee': '☕',
  'crop-pomegranate': '🍎',
  'crop-passion': '🟣',
  'crop-moringa': '🌿',
  'crop-banana': '🍌',
  'crop-turmeric': '🌱',
  'crop-mushroom': '🍄',
}

const FACILITY_ICON: Record<string, string> = {
  'facility-room': '🏠',
  'car-park': '🚗',
  'security-room': '🛡️',
  'football-field': '⚽',
  'main-building': '🏢',
  'solar-dryer-01': '☀️',
  'solar-dryer-02': '☀️',
  'solar-dryer-03': '☀️',
  'tunnel-200ft': '⛺',
  'nursery': '🌱',
  'loom-house': '🧵',
  'container-1': '📦',
  'container-2': '📦',
  'container-3': '📦',
  'summer-hut': '🛖',
  'kitchen': '🍳',
  'small-animal-sheds': '🐇',
  'greenhouse-9600ft': '⛺',
  'compost-area': '♻️',
  'chicken-farm': '🐔',
}

function iconCountFor(width: number, height: number) {
  return Math.max(6, Math.min(28, Math.round((width * height) / 35)))
}

type Selection = { type: 'area' | 'facility'; id: string } | null
type Overrides = Record<string, Partial<EditableFields>>

export function MapClient() {
  const [selection, setSelection] = useState<Selection>(null)
  const [overrides, setOverrides] = useState<Overrides>({})
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EditableFields | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading persisted state on mount, not derived from props/state
      try { setOverrides(JSON.parse(saved)) } catch { /* ignore corrupt storage */ }
    }
  }, [])

  const areas = baseAreas.map((a) => (overrides[a.id] ? { ...a, ...overrides[a.id] } : a))

  const selectedArea = selection?.type === 'area' ? areas.find((a) => a.id === selection.id) : undefined
  const selectedFacility = selection?.type === 'facility' ? facilities.find((f) => f.id === selection.id) : undefined
  const selectedCrop = selectedArea ? crops.find((c) => c.id === selectedArea.cropId) : undefined
  const selectedAnalysis = selectedArea ? getAnalysisForArea(selectedArea.id) : undefined
  const cropKeyword = selectedCrop?.name.split(' ')[0].toLowerCase()

  function startEdit() {
    if (!selectedArea) return
    setDraft({
      plantCount: selectedArea.plantCount,
      variety: selectedArea.variety,
      growthStage: selectedArea.growthStage,
      healthStatus: selectedArea.healthStatus,
      plantingDate: selectedArea.plantingDate,
      expectedHarvestDate: selectedArea.expectedHarvestDate,
      lastInspection: selectedArea.lastInspection,
      irrigationMethod: selectedArea.irrigationMethod,
      fertilizerSchedule: selectedArea.fertilizerSchedule,
      diseaseStatus: selectedArea.diseaseStatus,
      pestStatus: selectedArea.pestStatus,
      assignedStaff: selectedArea.assignedStaff,
    })
    setEditing(true)
  }

  function saveEdit() {
    if (!selectedArea || !draft) return
    const updated = { ...overrides, [selectedArea.id]: draft }
    setOverrides(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setEditing(false)
    setDraft(null)
  }

  function cancelEdit() {
    setEditing(false)
    setDraft(null)
  }
  const selectedSales = cropKeyword ? cropSales.filter((r) => r.cropName.toLowerCase().includes(cropKeyword)) : []

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Zone positions, names and crops on this map reflect the estate&apos;s real layout. Health scores, disease/pest
          findings and inspection details shown when you click a crop plot are <strong>illustrative sample data</strong> -
          real values will come from actual field inspections and weekly AI photo analysis once the platform is live.
          Recorded sales figures (bottom of each crop panel) are real, from the P&amp;L Cultivation sheet.
        </p>
      </Card>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Estate Layout - Silk Route Ventures Farm"
          subtitle="Click any crop plot or facility to view details. Redrawn to match the estate's real layout."
        />
        {/* Top canopy tree row, like the estate's roadside tree line */}
        <div className="mb-1 flex justify-between px-1 text-lg leading-none">
          {Array.from({ length: 12 }).map((_, i) => <span key={i}>🌳</span>)}
        </div>

        <div className="flex gap-1.5">
          <div
            className="relative flex-1 overflow-hidden rounded-2xl border-2 border-brand-800/80"
            style={{ aspectRatio: '10 / 11', background: '#173b2e' }}
          >
            {/* Left/lower facility + big Gurmar cluster, and right crop columns share this 0-100 grid.
                A vertical access road sits at x46-52 across the full height. */}
            {facilities.map((f) => {
              const icon = FACILITY_ICON[f.id] || '🏗️'
              return (
                <button
                  key={f.id}
                  onClick={() => { setSelection({ type: 'facility', id: f.id }); cancelEdit() }}
                  className="absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border p-0.5 text-center shadow-sm transition-transform hover:z-10 hover:scale-[1.04]"
                  style={{
                    left: `${f.mapX}%`, top: `${f.mapY}%`, width: `${f.mapWidth}%`, height: `${f.mapHeight}%`,
                    background: f.category === 'structure' ? '#e0d0b4' : '#f0e9dc',
                    borderColor: '#ad8452',
                  }}
                >
                  <span className="text-base leading-none sm:text-lg">{icon}</span>
                  <span className="px-0.5 text-[8px] font-semibold leading-tight text-earth-400 sm:text-[9px]">{f.name}</span>
                </button>
              )
            })}

            {/* Access road */}
            <div className="absolute bottom-0 top-0" style={{ left: '46%', width: '6%', background: '#9a9a94' }}>
              <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#e8c84a_0,#e8c84a_8px,transparent_8px,transparent_16px)]" />
            </div>

            {areas.map((area) => {
              const icon = CROP_ICON[area.cropId] || '🌱'
              const count = iconCountFor(area.mapWidth, area.mapHeight)
              return (
                <button
                  key={area.id}
                  onClick={() => { setSelection({ type: 'area', id: area.id }); cancelEdit() }}
                  className="absolute overflow-hidden rounded-lg border-2 shadow-sm transition-transform hover:z-10 hover:scale-[1.03]"
                  style={{
                    left: `${area.mapX}%`, top: `${area.mapY}%`, width: `${area.mapWidth}%`, height: `${area.mapHeight}%`,
                    background: '#fafcf8',
                    borderColor: '#2f4030',
                  }}
                >
                  <div
                    className="absolute inset-0 grid place-items-center opacity-70"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(16px, 1fr))', gridAutoRows: '16px' }}
                  >
                    {Array.from({ length: count }).map((_, i) => (
                      <span key={i} className="text-[13px] leading-none">{icon}</span>
                    ))}
                  </div>
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/85 px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]"
                  >
                    {area.name.replace(' Plot', '').replace(' - ', ' ')}
                  </span>
                  <span
                    className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-white/80"
                    style={{ background: zoneBorder[area.healthStatus] }}
                    title={`Health: ${area.healthStatus}`}
                  />
                </button>
              )
            })}

            {/* Bottom King Coconut border */}
            <div className="absolute inset-x-0 bottom-0 flex h-[3%] items-center justify-around bg-[#0c1b15] text-[8px]">
              {Array.from({ length: 20 }).map((_, i) => <span key={i}>🌴</span>)}
            </div>
          </div>

          {/* Right King Coconut border */}
          <div className="flex w-[4%] shrink-0 flex-col items-center justify-around rounded-lg bg-[#0c1b15] py-1">
            {Array.from({ length: 15 }).map((_, i) => <span key={i} className="text-[9px] leading-none">🌴</span>)}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-brand-700/50">
          <span>20 King Coconut Plant · 25×25 Spacing (bottom border)</span>
          <span>30 King Coconut Plant · 25×25 Spacing (right border)</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          {(['healthy', 'attention', 'moderate', 'critical'] as HealthStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-white/80" style={{ background: zoneBorder[s] }} />
              <span className="capitalize text-brand-700/70">{s} (corner dot on crop plots)</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-earth-300" style={{ background: '#f0e9dc' }} />
            <span className="text-brand-700/70">Facility / Structure</span>
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader title="Details" subtitle={selection ? undefined : 'Select a zone on the map'} />
        {!selection && (
          <div className="flex h-64 flex-col items-center justify-center text-center text-brand-700/40">
            <MapPin size={28} className="mb-2" />
            <p className="text-sm">Click any crop plot or facility on the map to see details here.</p>
          </div>
        )}

        {selectedFacility && (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-earth-100 text-earth-400"><Building2 size={17} /></span>
                <div>
                  <p className="text-base font-semibold text-brand-800">{selectedFacility.name}</p>
                  <p className="text-xs capitalize text-brand-700/50">{selectedFacility.category}</p>
                </div>
              </div>
              <button onClick={() => setSelection(null)} className="rounded-lg p-1.5 hover:bg-brand-50"><X size={16} /></button>
            </div>
            <p className="text-sm text-brand-700/70">{selectedFacility.description}</p>
          </div>
        )}

        {selectedArea && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-brand-800">{selectedArea.name}</p>
                <p className="text-xs text-brand-700/50">{selectedArea.gpsLocation || 'GPS not yet surveyed'}</p>
              </div>
              <div className="flex items-center gap-1">
                {!editing && (
                  <button onClick={startEdit} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50">
                    <Pencil size={13} /> Edit
                  </button>
                )}
                <button onClick={() => { setSelection(null); cancelEdit() }} className="rounded-lg p-1.5 hover:bg-brand-50"><X size={16} /></button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ScoreRing value={selectedArea.aiHealthScore} />
              <div>
                <HealthBadge status={selectedArea.healthStatus} />
                <p className="mt-1 text-xs text-brand-700/50">AI Health Score</p>
              </div>
            </div>

            {editing && draft ? (
              <div className="space-y-3 rounded-xl border border-brand-100 p-3">
                <EditField label="Plant Count" type="number" value={draft.plantCount} onChange={(v) => setDraft({ ...draft, plantCount: Number(v) })} />
                <EditField label="Variety" value={draft.variety} onChange={(v) => setDraft({ ...draft, variety: v })} />
                <EditField label="Growth Stage" value={draft.growthStage} onChange={(v) => setDraft({ ...draft, growthStage: v })} />
                <EditSelect
                  label="Health Status"
                  value={draft.healthStatus}
                  options={['healthy', 'attention', 'moderate', 'critical']}
                  onChange={(v) => setDraft({ ...draft, healthStatus: v as HealthStatus })}
                />
                <EditField label="Planting Date" type="date" value={draft.plantingDate} onChange={(v) => setDraft({ ...draft, plantingDate: v })} />
                <EditField label="Expected Harvest" type="date" value={draft.expectedHarvestDate} onChange={(v) => setDraft({ ...draft, expectedHarvestDate: v })} />
                <EditField label="Last Inspection" type="date" value={draft.lastInspection} onChange={(v) => setDraft({ ...draft, lastInspection: v })} />
                <EditField label="Irrigation" value={draft.irrigationMethod} onChange={(v) => setDraft({ ...draft, irrigationMethod: v })} />
                <EditField label="Fertilizer Schedule" value={draft.fertilizerSchedule} onChange={(v) => setDraft({ ...draft, fertilizerSchedule: v })} />
                <EditField label="Disease Status" value={draft.diseaseStatus} onChange={(v) => setDraft({ ...draft, diseaseStatus: v })} />
                <EditField label="Pest Status" value={draft.pestStatus} onChange={(v) => setDraft({ ...draft, pestStatus: v })} />
                <EditField
                  label="Assigned Staff (comma-separated)"
                  value={draft.assignedStaff.join(', ')}
                  onChange={(v) => setDraft({ ...draft, assignedStaff: v.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">Save</button>
                  <button onClick={cancelEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-700/70 hover:bg-brand-50">Cancel</button>
                </div>
                <p className="text-[10px] text-brand-700/40">Saved to this browser only for now - needs the Supabase connection wired in to sync across devices.</p>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <Field label="Size" value={`${selectedArea.sizeAcres} ac`} />
                <Field label="Plant Count" value={selectedArea.plantCount.toLocaleString()} />
                <Field label="Crop" value={selectedCrop?.name || '—'} />
                <Field label="Variety" value={selectedArea.variety} />
                <Field label="Planting Date" value={formatDate(selectedArea.plantingDate)} />
                <Field label="Expected Harvest" value={formatDate(selectedArea.expectedHarvestDate)} />
                <Field label="Growth Stage" value={selectedArea.growthStage} />
                <Field label="Last Inspection" value={formatDate(selectedArea.lastInspection)} />
                <Field label="Irrigation" value={selectedArea.irrigationMethod} />
                <Field label="Fertilizer Schedule" value={selectedArea.fertilizerSchedule} />
                <Field label="Disease Status" value={selectedArea.diseaseStatus} full />
                <Field label="Pest Status" value={selectedArea.pestStatus} full />
                <Field label="Assigned Staff" value={selectedArea.assignedStaff.join(', ')} full />
              </dl>
            )}

            {selectedAnalysis && (
              <div className="rounded-xl bg-brand-50 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700"><Sparkles size={13} /> AI Summary</p>
                <p className="text-xs text-brand-700/70">{selectedAnalysis.recommendedActions[0]}</p>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-semibold text-brand-700/70">Recorded Sales (estate-wide, from P&amp;L sheet)</p>
              {selectedSales.length === 0 && <p className="text-xs text-brand-700/40">No recorded sales for this crop yet.</p>}
              <ul className="space-y-1">
                {selectedSales.map((r) => (
                  <li key={r.id} className="flex justify-between text-xs text-brand-700/70">
                    <span>{r.month} · {r.quantity}</span>
                    <span>{formatCurrency(r.incomeRs)}</span>
                  </li>
                ))}
              </ul>
              {selectedSales.length > 0 && (
                <p className="mt-1 text-[10px] text-brand-700/40">Not necessarily from this specific plot - the source sheet tracks sales by crop, not by mapped zone.</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
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

function EditField({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; type?: 'text' | 'number' | 'date' }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-brand-700/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      />
    </label>
  )
}

function EditSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-brand-700/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm capitalize text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
