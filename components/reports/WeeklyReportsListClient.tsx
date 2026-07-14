'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, CalendarCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'
import type { HartiAnalysis } from '@/lib/harti-types'

interface WeeklyReportEntry {
  weekStart: string
  weekEnd: string
  generatedAt: string
  analysis: HartiAnalysis
}

function weekLabel(index: number) {
  return `Week ${String(index + 1).padStart(2, '0')}`
}

export function WeeklyReportsListClient() {
  const [weeks, setWeeks] = useState<WeeklyReportEntry[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/harti-analysis/weekly-history?limit=500')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setWeeks(data.weeks || [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load weekly reports.'))
  }, [])

  if (error) {
    return (
      <Card className="border-status-critical/30 bg-status-critical/5">
        <p className="text-sm text-status-critical">{error}</p>
      </Card>
    )
  }

  if (!weeks) {
    return (
      <Card>
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
          <Loader2 size={16} className="animate-spin" /> Loading weekly reports...
        </div>
      </Card>
    )
  }

  // Sequential "Week NN" numbering is assigned by chronological order
  // (ascending week_start) - the first report ever saved is Week 01 -
  // independent of HARTI's own bulletin week numbers.
  const ascending = [...weeks].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  const weekNumberByStart = new Map(ascending.map((w, i) => [w.weekStart, i]))
  const newestFirst = [...weeks].sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  return (
    <>
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          A weekly snapshot of the HARTI Market Intelligence analysis (Passion Fruit &amp; Moringa market comparison,
          5-tunnel health diagnostics, action items and risk alerts), saved automatically every Monday and enriched
          whenever someone views that page. Click a week to see its full report.
        </p>
      </Card>

      {newestFirst.length === 0 ? (
        <Card>
          <p className="text-sm text-brand-700/60">
            No weekly reports saved yet - visit HARTI Market Intelligence to generate this week&apos;s report, or wait for Monday&apos;s automatic run.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newestFirst.map((w) => {
            const idx = weekNumberByStart.get(w.weekStart) ?? 0
            return (
              <Link key={w.weekStart} href={`/weekly-reports/${w.weekStart}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <CalendarCheck size={20} />
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-600">
                      Open <ArrowRight size={13} />
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-brand-800">{weekLabel(idx)}</p>
                  <p className="text-sm text-brand-700/60">{formatDate(w.weekStart)} - {formatDate(w.weekEnd)}</p>
                  <p className="mt-3 line-clamp-3 text-xs text-brand-700/70">{w.analysis.hartiSummary}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
