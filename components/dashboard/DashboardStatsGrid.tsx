'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LandPlot, Leaf, Sprout, ShieldCheck, AlertTriangle, Wheat, CalendarClock, Gauge, ListChecks, ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'
import type { PlantationArea, Crop, AiCropAnalysis } from '@/lib/types'

interface StatDef {
  key: string
  label: string
  value: string
  icon: LucideIcon
  tone?: 'brand' | 'earth' | 'warn' | 'critical'
  hint?: string
}

// Some totals below (Plantation Area, Cultivated Area, Crops, Total/Healthy/
// Needs Attention Plants) were provided as updated current figures on
// 2026-07-15, ahead of the individual plantation area/crop records in
// lib/mock-data being updated to match. The click-through detail below still
// lists the real, individually recorded areas/crops - so totals shown at the
// top of the card may not yet exactly match the count of items listed below
// until those specific records are updated.
const PROVISIONAL_NOTE =
  'This figure was provided as an updated total on 2026-07-15, ahead of the individual records below being updated to match.'

function areaLine(a: PlantationArea) {
  return `${a.name} - ${a.sizeAcres} ac, ${a.plantCount.toLocaleString()} plants (${a.healthStatus})`
}

export function DashboardStatsGrid({
  stats,
  areas,
  crops,
  aiAnalyses,
}: {
  stats: {
    totalAreaAcres: number
    totalCultivatedAreaAcres: number
    numberOfCrops: number
    totalPlants: number
    healthyPlants: number
    attentionPlants: number
    harvestReadyAreas: number
    upcomingHarvests: number
    weeklyProductionEstimateKg: number
    activeTasks: number
  }
  areas: PlantationArea[]
  crops: Crop[]
  aiAnalyses: AiCropAnalysis[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const harvestReadyList = aiAnalyses
    .filter((a) => a.harvestReadinessPct >= 85)
    .map((a) => areas.find((ar) => ar.id === a.areaId))
    .filter((a): a is PlantationArea => !!a)

  const upcomingHarvestList = aiAnalyses
    .filter((a) => a.daysRemaining <= 21)
    .map((a) => areas.find((ar) => ar.id === a.areaId))
    .filter((a): a is PlantationArea => !!a)

  const healthyAreas = areas.filter((a) => a.healthStatus === 'healthy')
  const attentionAreas = areas.filter((a) => a.healthStatus !== 'healthy')

  const stat = (
    key: string,
    label: string,
    value: string,
    icon: LucideIcon,
    tone: StatDef['tone'],
    hint: string | undefined,
    detail: { note?: string; lines: string[] },
  ) => ({ key, label, value, icon, tone, hint, detail })

  const items = [
    stat('plantationArea', 'Plantation Area', `${stats.totalAreaAcres.toFixed(1)} ac`, LandPlot, 'brand', undefined, {
      note: PROVISIONAL_NOTE,
      lines: areas.map(areaLine),
    }),
    stat('cultivatedArea', 'Cultivated Area', `${stats.totalCultivatedAreaAcres.toFixed(1)} ac`, Leaf, 'earth', undefined, {
      note: PROVISIONAL_NOTE,
      lines: areas.map(areaLine),
    }),
    stat('crops', 'Crops', `${stats.numberOfCrops}`, Sprout, 'brand', undefined, {
      note: PROVISIONAL_NOTE,
      lines: crops.map((c) => `${c.name} - ${c.variety}, ${c.plantCount.toLocaleString()} plants`),
    }),
    stat('totalPlants', 'Total Plants', stats.totalPlants.toLocaleString(), Sprout, 'brand', undefined, {
      note: PROVISIONAL_NOTE,
      lines: areas.map(areaLine),
    }),
    stat('healthyPlants', 'Healthy Plants', stats.healthyPlants.toLocaleString(), ShieldCheck, 'brand', undefined, {
      note: PROVISIONAL_NOTE,
      lines: healthyAreas.length ? healthyAreas.map(areaLine) : ['No areas currently marked healthy.'],
    }),
    stat('attentionPlants', 'Needs Attention', stats.attentionPlants.toLocaleString(), AlertTriangle, 'warn', undefined, {
      note: PROVISIONAL_NOTE,
      lines: attentionAreas.length ? attentionAreas.map(areaLine) : ['No areas currently flagged.'],
    }),
    stat('harvestReadyAreas', 'Harvest Ready Areas', `${stats.harvestReadyAreas}`, Wheat, 'brand', undefined, {
      lines: harvestReadyList.length ? harvestReadyList.map(areaLine) : ['No areas currently at 85%+ harvest readiness.'],
    }),
    stat('upcomingHarvests', 'Upcoming Harvests', `${stats.upcomingHarvests}`, CalendarClock, 'earth', undefined, {
      lines: upcomingHarvestList.length ? upcomingHarvestList.map(areaLine) : ['No harvests expected within 21 days.'],
    }),
    stat('weeklyProduction', 'Weekly Production Est. (AI)', `${stats.weeklyProductionEstimateKg} kg`, Gauge, 'brand', 'Illustrative forecast', {
      lines: ['Sum of each area\'s AI-estimated yield, spread across its days-to-harvest - an illustrative estimate, not a measured figure.'],
    }),
    stat('activeTasks', 'Active Tasks', `${stats.activeTasks}`, ListChecks, 'earth', undefined, {
      lines: ['See Task Management for the full list of open tasks.'],
    }),
  ]

  const toneStyles = {
    brand: 'bg-brand-50 text-brand-600',
    earth: 'bg-earth-100 text-earth-400',
    warn: 'bg-status-attention/10 text-status-attention',
    critical: 'bg-status-critical/10 text-status-critical',
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const isOpen = expanded === item.key
        const Icon = item.icon
        return (
          <div key={item.key} className={clsx('xl:col-span-1', isOpen && 'col-span-2 sm:col-span-3 xl:col-span-5')}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : item.key)}
              className="w-full rounded-2xl border border-brand-100 bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-brand-700/70">{item.label}</span>
                <span className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', toneStyles[item.tone || 'brand'])}>
                  <Icon size={16} />
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold text-brand-800">{item.value}</p>
                <ChevronDown size={16} className={clsx('text-brand-700/40 transition-transform', isOpen && 'rotate-180')} />
              </div>
              {item.hint && <p className="mt-1 text-xs text-brand-700/50">{item.hint}</p>}
            </button>

            {isOpen && (
              <div className="mt-2 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                {item.detail.note && (
                  <p className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{item.detail.note}</p>
                )}
                <ul className="space-y-1 text-xs text-brand-700/70">
                  {item.detail.lines.map((line, i) => (
                    <li key={i}>• {line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
