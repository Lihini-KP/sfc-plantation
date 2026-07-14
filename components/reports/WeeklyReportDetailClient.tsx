'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import { AnalysisView } from '@/components/harti/AnalysisView'
import type { HartiAnalysis } from '@/lib/harti-types'

interface WeeklyReportEntry {
  weekStart: string
  weekEnd: string
  generatedAt: string
  analysis: HartiAnalysis
}

export function WeeklyReportDetailClient({ weekStart }: { weekStart: string }) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; report: WeeklyReportEntry; weekNumber: number }
  >({ status: 'loading' })

  useEffect(() => {
    fetch('/api/harti-analysis/weekly-history?limit=500')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        const weeks: WeeklyReportEntry[] = data.weeks || []
        const report = weeks.find((w) => w.weekStart === weekStart)
        if (!report) throw new Error('This weekly report was not found - it may have been generated on a different week.')
        const ascending = [...weeks].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
        const weekNumber = ascending.findIndex((w) => w.weekStart === weekStart) + 1
        setState({ status: 'success', report, weekNumber })
      })
      .catch((err) => setState({ status: 'error', message: err instanceof Error ? err.message : 'Could not load this report.' }))
  }, [weekStart])

  return (
    <>
      <Link href="/weekly-reports" className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft size={14} /> Back to Weekly Reports
      </Link>

      {state.status === 'loading' && (
        <Card>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
            <Loader2 size={16} className="animate-spin" /> Loading report...
          </div>
        </Card>
      )}

      {state.status === 'error' && (
        <Card className="border-status-critical/30 bg-status-critical/5">
          <p className="text-sm text-status-critical">{state.message}</p>
        </Card>
      )}

      {state.status === 'success' && (
        <>
          <Card>
            <CardHeader
              title={`Week ${String(state.weekNumber).padStart(2, '0')}`}
              subtitle={`${formatDate(state.report.weekStart)} - ${formatDate(state.report.weekEnd)} · Generated ${formatDate(state.report.generatedAt.slice(0, 10))}`}
            />
          </Card>
          <AnalysisView
            analysis={state.report.analysis}
            marketSummarySubtitle={`Weekly Food Commodities Bulletin - Week of ${formatDate(state.report.weekStart)} to ${formatDate(state.report.weekEnd)}`}
            footerNote={`Report saved ${formatDate(state.report.generatedAt.slice(0, 10))}`}
          />
        </>
      )}
    </>
  )
}
