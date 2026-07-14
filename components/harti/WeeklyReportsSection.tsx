'use client'

import { useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import { AnalysisView } from './AnalysisView'
import type { HartiAnalysis } from '@/lib/harti-types'

export interface WeeklyReportEntry {
  weekStart: string
  weekEnd: string
  generatedAt: string
  analysis: HartiAnalysis
}

function weekLabel(index: number) {
  return `Week ${String(index + 1).padStart(2, '0')}`
}

// Archive of saved weekly analyses, numbered sequentially (Week 01 = the
// first ever saved), rendered inline - clicking a week expands its full
// report in place, no navigation to a separate page.
export function WeeklyReportsSection({ history, loading }: { history: WeeklyReportEntry[]; loading: boolean }) {
  const [openWeek, setOpenWeek] = useState<string | null>(null)

  if (loading && history.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-brand-700/60">
          <Loader2 size={16} className="animate-spin" /> Loading weekly reports...
        </div>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <p className="text-sm text-brand-700/60">
          No weekly reports saved yet. One saves automatically after each analysis run, and every Monday via the scheduled job.
        </p>
      </Card>
    )
  }

  const ascending = [...history].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  const weekNumberByStart = new Map(ascending.map((w, i) => [w.weekStart, i]))
  const newestFirst = [...history].sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  return (
    <div className="space-y-2">
      {newestFirst.map((w) => {
        const idx = weekNumberByStart.get(w.weekStart) ?? 0
        const isOpen = openWeek === w.weekStart
        return (
          <div key={w.weekStart} className="rounded-2xl border border-brand-100 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpenWeek(isOpen ? null : w.weekStart)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-brand-800">{weekLabel(idx)}</p>
                <p className="text-xs text-brand-700/60">
                  {formatDate(w.weekStart)} - {formatDate(w.weekEnd)} · Generated {formatDate(w.generatedAt.slice(0, 10))}
                </p>
              </div>
              <ChevronDown size={16} className={`shrink-0 text-brand-700/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="space-y-6 border-t border-brand-100 p-4">
                <AnalysisView
                  analysis={w.analysis}
                  marketSummarySubtitle={`Weekly Food Commodities Bulletin - Week of ${formatDate(w.weekStart)} to ${formatDate(w.weekEnd)}`}
                  footerNote={`Report saved ${formatDate(w.generatedAt.slice(0, 10))}`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
