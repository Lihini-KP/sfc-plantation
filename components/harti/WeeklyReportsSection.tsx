'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import { AnalysisView } from './AnalysisView'
import { PassionFruitPriceChart } from './PassionFruitPriceChart'
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

function trendLabel(analysis: HartiAnalysis) {
  const primary = (analysis.cropMarketTrends ?? [])[0]
  if (!primary) return { label: 'No data', Icon: Minus }
  if (primary.trend === 'up') return { label: 'Increasing', Icon: TrendingUp }
  if (primary.trend === 'down') return { label: 'Falling', Icon: TrendingDown }
  return { label: 'Mostly Stable', Icon: Minus }
}

// Archive of saved weekly analyses, numbered sequentially (Week 01 = the
// first ever saved), rendered inline - clicking "View Report" expands that
// week's full report in place, no navigation to a separate page and no new
// AI call (it's just displaying what was already saved).
export function WeeklyReportsSection({ history, loading }: { history: WeeklyReportEntry[]; loading: boolean }) {
  const [openWeek, setOpenWeek] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader title="Weekly Reports" subtitle="Saved HARTI analyses, one per bulletin week - the source of truth for past weeks" />

      <div className="mb-2">
        <PassionFruitPriceChart />
      </div>

      {loading && history.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-brand-700/60">
          <Loader2 size={16} className="animate-spin" /> Loading weekly reports...
        </div>
      )}

      {!loading && history.length === 0 && (
        <p className="text-sm text-brand-700/60">
          No weekly reports saved yet. One saves automatically every Monday via the scheduled job, or when an admin runs the analysis manually.
        </p>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          {(() => {
            const ascending = [...history].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
            const weekNumberByStart = new Map(ascending.map((w, i) => [w.weekStart, i]))
            const newestFirst = [...history].sort((a, b) => b.weekStart.localeCompare(a.weekStart))

            return newestFirst.map((w) => {
              const idx = weekNumberByStart.get(w.weekStart) ?? 0
              const isOpen = openWeek === w.weekStart
              const { label, Icon } = trendLabel(w.analysis)
              const recCount = (w.analysis.tunnels ?? []).flatMap((t) => t.issues).length
              const riskCount = (w.analysis.riskAlerts ?? []).length

              return (
                <div key={w.weekStart} className="rounded-2xl border border-[#E5EFE5] bg-white shadow-sm transition-colors hover:bg-[#F5FAF5]">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-[18px]">
                    <div>
                      <p className="text-sm font-semibold text-brand-800">{weekLabel(idx)}</p>
                      <p className="mt-0.5 text-xs text-brand-700/60">{formatDate(w.generatedAt.slice(0, 10))}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-700/70">
                        <span className="flex items-center gap-1"><Icon size={12} className="text-brand-600" /> Market Trend: <span className="font-medium text-brand-800">{label}</span></span>
                        <span>AI Recommendations: <span className="font-medium text-brand-800">{recCount}</span></span>
                        <span>Risk Alerts: <span className="font-medium text-brand-800">{riskCount}</span></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenWeek(isOpen ? null : w.weekStart)}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 px-3 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                    >
                      {isOpen ? 'Hide Report' : 'View Report'}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="space-y-6 border-t border-[#E5EFE5] p-[18px]">
                      <AnalysisView
                        analysis={w.analysis}
                        marketSummarySubtitle={`Weekly Food Commodities Bulletin - Week of ${formatDate(w.weekStart)} to ${formatDate(w.weekEnd)}`}
                        footerNote={`Report saved ${formatDate(w.generatedAt.slice(0, 10))}`}
                      />
                    </div>
                  )}
                </div>
              )
            })
          })()}
        </div>
      )}
    </Card>
  )
}
