'use client'

import { useEffect, useState } from 'react'
import {
  RefreshCw, ExternalLink, Loader2, TrendingUp, TrendingDown, Minus,
  FileText, Scale, HeartPulse, Lightbulb, ListChecks, AlertTriangle, CalendarClock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { formatDate } from '@/lib/format'
import { useRole } from '@/lib/role-context'
import type { TunnelPhotoEntry } from '@/lib/types'
import type { HartiAnalysis } from '@/lib/harti-types'
import { DashboardSummaryCard } from './DashboardSummaryCard'
import { WeeklyReportsSection, type WeeklyReportEntry } from './WeeklyReportsSection'

const WEEKLY_SOURCE_URL = 'https://www.harti.gov.lk/weekly-price.php'
const STORAGE_PREFIX = 'sfc-tunnel-photos-'

function gatherTunnelPhotoData() {
  return greenhouses.map((g) => {
    const seed = getPhotoLogsForTunnel(g.id)
    let local: TunnelPhotoEntry[] = []
    const saved = localStorage.getItem(STORAGE_PREFIX + g.id)
    if (saved) {
      try { local = JSON.parse(saved) } catch { /* ignore corrupt storage */ }
    }
    const allLogs = [...local, ...seed].sort((a, b) => b.date.localeCompare(a.date))
    const latest = allLogs[0]
    return {
      tunnelId: g.id,
      tunnelName: g.tunnel,
      cropName: g.cropName,
      sqft: g.sqft,
      logCount: allLogs.length,
      latestLog: latest
        ? {
            date: latest.date,
            healthAssessment: latest.healthAssessment,
            detectedIssues: latest.detectedIssues,
            recommendedActions: latest.recommendedActions,
            severity: latest.severity,
          }
        : null,
    }
  })
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function HartiMarketClient() {
  const { role } = useRole()
  const isAdmin = role === 'Admin'

  const [history, setHistory] = useState<WeeklyReportEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [priceThisWeekRs, setPriceThisWeekRs] = useState<number | null>(null)

  const [runStatus, setRunStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [runError, setRunError] = useState('')
  const [saveWarning, setSaveWarning] = useState('')

  async function loadHistory() {
    try {
      const res = await fetch('/api/harti-analysis/weekly-history?limit=500')
      const data = await res.json()
      if (res.ok) setHistory(data.weeks || [])
    } catch { /* history is a nice-to-have - ignore failures */ } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the initial data fetch on mount, not deriving state
    loadHistory()
  }, [])

  // The current week's report, if the scheduled Monday job (or an admin's
  // manual run) has already saved one - never triggers a new AI call itself.
  const today = todayIso()
  const currentWeekReport = history.find((w) => w.weekStart <= today && today <= w.weekEnd) ?? null

  const currentWeekStart = currentWeekReport?.weekStart ?? null

  useEffect(() => {
    if (!currentWeekStart) return
    let cancelled = false
    fetch('/api/harti-analysis/price-history')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const points: { weekStart: string; avgPriceRs: number }[] = data.points || []
        const match = points.find((p) => p.weekStart === currentWeekStart)
        setPriceThisWeekRs(match ? match.avgPriceRs : null)
      })
      .catch(() => { /* nice-to-have stat only */ })
    return () => { cancelled = true }
  }, [currentWeekStart])

  // Admin-only: manually (re)run the AI analysis for the current week -
  // otherwise the page only ever displays whatever the scheduled Monday job
  // (or a previous manual run) already saved.
  async function runAnalysisNow() {
    setRunStatus('loading')
    setRunError('')
    setSaveWarning('')
    try {
      const tunnelPhotoData = gatherTunnelPhotoData()
      const [marketRes, tunnelRes] = await Promise.all([
        fetch('/api/harti-analysis/market', { method: 'POST' }),
        fetch('/api/harti-analysis/tunnels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tunnelPhotoData }),
        }),
      ])
      const marketData = await marketRes.json()
      const tunnelData = await tunnelRes.json()
      if (!marketRes.ok) throw new Error(marketData.error || 'Market analysis failed.')
      if (!tunnelRes.ok) throw new Error(tunnelData.error || 'Tunnel analysis failed.')

      const merged: HartiAnalysis = {
        hartiSummary: marketData.analysis.hartiSummary,
        cropMarketTrends: marketData.analysis.cropMarketTrends,
        plantationVsMarket: marketData.analysis.plantationVsMarket,
        tunnelHealthScores: tunnelData.analysis.tunnelHealthScores,
        tunnels: tunnelData.analysis.tunnels,
        actionItems: [...marketData.analysis.actionItems, ...tunnelData.analysis.actionItems],
        riskAlerts: [...marketData.analysis.riskAlerts, ...tunnelData.analysis.riskAlerts],
      }

      if (marketData.bulletinMeta?.saveWarning) setSaveWarning(marketData.bulletinMeta.saveWarning)

      if (marketData.bulletinMeta?.weekStart && marketData.bulletinMeta?.weekEnd) {
        await fetch('/api/harti-analysis/weekly-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStart: marketData.bulletinMeta.weekStart,
            weekEnd: marketData.bulletinMeta.weekEnd,
            analysis: merged,
          }),
        }).catch(() => { /* best-effort */ })
      }

      setRunStatus('idle')
      await loadHistory()
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Analysis failed.')
      setRunStatus('error')
    }
  }

  // --- Dashboard summary card stats, all derived from the current week's saved report ---
  const analysis = currentWeekReport?.analysis ?? null
  const dash = (value: string) => (analysis ? value : '—')

  const cropMarketTrends = analysis?.cropMarketTrends ?? []
  const primaryTrend = cropMarketTrends[0]
  const trendText = primaryTrend ? (primaryTrend.trend === 'up' ? 'Rising' : primaryTrend.trend === 'down' ? 'Falling' : 'Stable') : '—'
  const TrendIcon = primaryTrend ? (primaryTrend.trend === 'up' ? TrendingUp : primaryTrend.trend === 'down' ? TrendingDown : Minus) : TrendingUp

  const ascendingHistory = [...history].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  const latestReport = history.length ? [...history].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0] : null
  const latestReportWeekNumber = latestReport ? ascendingHistory.findIndex((w) => w.weekStart === latestReport.weekStart) + 1 : null

  const plantationVsMarket = analysis?.plantationVsMarket ?? []
  const misalignedCount = plantationVsMarket.filter((p) => p.alignment.toLowerCase().includes('misalign')).length

  const tunnelHealthScores = analysis?.tunnelHealthScores ?? []
  const scoredTunnels = tunnelHealthScores.filter((t) => t.dataAvailable)
  const avgTunnelHealth = scoredTunnels.length ? Math.round(scoredTunnels.reduce((sum, t) => sum + t.score, 0) / scoredTunnels.length) : null
  const healthyTunnels = scoredTunnels.filter((t) => t.score >= 70).length
  const warningTunnels = scoredTunnels.filter((t) => t.score >= 40 && t.score < 70).length
  const criticalTunnels = scoredTunnels.filter((t) => t.score < 40).length

  const allIssues = (analysis?.tunnels ?? []).flatMap((t) => t.issues)
  const highPriorityCount = allIssues.filter((i) => ['high', 'critical'].includes(i.priority.toLowerCase())).length
  const mediumPriorityCount = allIssues.filter((i) => i.priority.toLowerCase() === 'medium').length
  const lowPriorityCount = allIssues.filter((i) => i.priority.toLowerCase() === 'low').length

  const actionItems = analysis?.actionItems ?? []

  const riskAlerts = analysis?.riskAlerts ?? []
  const criticalAlertCount = riskAlerts.filter((r) => r.severity.toLowerCase() === 'critical').length
  const mediumAlertCount = riskAlerts.filter((r) => r.severity.toLowerCase() === 'medium').length

  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Scoped to our 5 greenhouse tunnels (Alpha, Bravo, Charlie, Oregano, Echo), the Passion Fruit plot, and the
          Moringa plot against HARTI&apos;s (Hector Kobbekaduwa Agrarian Research and Training Institute) real WEEKLY
          Food Commodities Bulletin. Analysis runs automatically every Monday and is saved as a Weekly Report - this
          page always shows the latest saved snapshot rather than calling the AI on every visit. HARTI publishes no
          market price data for Moringa, so it is shown with our real plantation data only, not an invented trend.
        </p>
      </Card>

      {saveWarning && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-xs text-amber-800">{saveWarning} - the analysis ran successfully but won&apos;t appear in Weekly Reports until this is fixed.</p>
        </Card>
      )}

      {runStatus === 'error' && (
        <Card className="border-status-critical/30 bg-status-critical/5">
          <p className="text-sm text-status-critical">{runError}</p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <a
          href={WEEKLY_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          View HARTI Market Information <ExternalLink size={14} />
        </a>
        {isAdmin && (
          <button
            onClick={runAnalysisNow}
            disabled={runStatus === 'loading'}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <RefreshCw size={15} className={runStatus === 'loading' ? 'animate-spin' : ''} />
            {runStatus === 'loading' ? 'Analyzing...' : 'Run Analysis'}
          </button>
        )}
      </div>

      {historyLoading && (
        <Card>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
            <Loader2 size={16} className="animate-spin" /> Loading this week&apos;s report...
          </div>
        </Card>
      )}

      {!historyLoading && !currentWeekReport && (
        <Card className="border-dashed border-brand-200 bg-brand-50/50">
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CalendarClock size={22} className="text-brand-600" />
            <p className="text-sm font-medium text-brand-800">No report generated for this week yet.</p>
            <p className="text-xs text-brand-700/60">Next scheduled analysis: Monday 08:00 AM.</p>
          </div>
        </Card>
      )}

      {!historyLoading && currentWeekReport && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardSummaryCard
            icon={TrendIcon}
            title="Crop Wise Market Trend"
            tone={primaryTrend?.trend === 'down' ? 'critical' : 'brand'}
            stats={[
              { label: 'Crops Tracked', value: dash(`${cropMarketTrends.length}`) },
              { label: "This Week's Movement", value: primaryTrend ? `${primaryTrend.changePct > 0 ? '+' : ''}${primaryTrend.changePct}%` : '—' },
              { label: 'Overall Trend', value: trendText },
            ]}
          />
          <DashboardSummaryCard
            icon={FileText}
            title="Weekly Reports"
            tone="earth"
            stats={[
              { label: 'Latest Report', value: latestReportWeekNumber ? `Week ${String(latestReportWeekNumber).padStart(2, '0')}` : 'None yet' },
              { label: 'Generated', value: latestReport ? formatDate(latestReport.generatedAt.slice(0, 10)) : '—' },
            ]}
          />
          <DashboardSummaryCard
            icon={Scale}
            title="Plantation vs Market"
            stats={[
              { label: 'Market Price', value: priceThisWeekRs != null ? `Rs ${Math.round(priceThisWeekRs)}/kg` : '—' },
              { label: 'Crops Compared', value: dash(`${plantationVsMarket.length}`) },
              { label: 'Misaligned', value: dash(`${misalignedCount}`) },
            ]}
          />
          <DashboardSummaryCard
            icon={HeartPulse}
            title="Tunnel Health Score"
            tone={criticalTunnels > 0 ? 'critical' : warningTunnels > 0 ? 'warn' : 'brand'}
            stats={[
              { label: 'Average Score', value: avgTunnelHealth !== null ? `${avgTunnelHealth}%` : 'No data' },
              { label: 'Healthy', value: dash(`${healthyTunnels}`) },
              { label: 'Warning', value: dash(`${warningTunnels}`) },
              { label: 'Critical', value: dash(`${criticalTunnels}`) },
            ]}
          />
          <DashboardSummaryCard
            icon={Lightbulb}
            title="AI Recommendations"
            tone="earth"
            stats={[
              { label: 'Total', value: dash(`${allIssues.length}`) },
              { label: 'High Priority', value: dash(`${highPriorityCount}`) },
              { label: 'Medium Priority', value: dash(`${mediumPriorityCount}`) },
              { label: 'Low Priority', value: dash(`${lowPriorityCount}`) },
            ]}
          />
          <DashboardSummaryCard
            icon={ListChecks}
            title="Action Items"
            stats={[
              { label: 'Pending', value: dash(`${actionItems.length}`) },
              { label: 'In Progress', value: dash('0') },
              { label: 'Completed', value: dash('0') },
            ]}
          />
          <DashboardSummaryCard
            icon={AlertTriangle}
            title="Risk Alerts"
            tone={criticalAlertCount > 0 ? 'critical' : riskAlerts.length > 0 ? 'warn' : 'brand'}
            stats={[
              { label: 'Active', value: dash(`${riskAlerts.length}`) },
              { label: 'Critical', value: dash(`${criticalAlertCount}`) },
              { label: 'Medium', value: dash(`${mediumAlertCount}`) },
            ]}
          />
        </div>
      )}

      <WeeklyReportsSection history={history} loading={historyLoading} />
    </div>
  )
}
