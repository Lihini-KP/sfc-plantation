'use client'

import { useEffect, useState } from 'react'
import {
  RefreshCw, ExternalLink, Loader2, TrendingUp, TrendingDown, Minus,
  FileText, Scale, HeartPulse, Lightbulb, ListChecks, AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { formatDate } from '@/lib/format'
import type { TunnelPhotoEntry } from '@/lib/types'
import type { HartiAnalysis } from '@/lib/harti-types'
import {
  MarketTrendSection, PlantationComparisonSection, TunnelHealthSection,
  RecommendationsSection, ActionItemsSection, RiskAlertsSection,
} from './AnalysisView'
import { PassionFruitPriceChart } from './PassionFruitPriceChart'
import { DashboardSummaryCard } from './DashboardSummaryCard'
import { CollapsibleSection } from './CollapsibleSection'
import { WeeklyReportsSection, type WeeklyReportEntry } from './WeeklyReportsSection'

const WEEKLY_SOURCE_URL = 'https://www.harti.gov.lk/weekly-price.php'

type Analysis = HartiAnalysis
interface BulletinMeta {
  weekStart: string
  weekEnd: string
  bulletinVolume: number | null
  bulletinIssue: number | null
  pdfUrl: string
  sourceUrl: string
  usedFallback: boolean
  fallbackReason?: string
  saveWarning?: string
  wholesaleAvgThisWeekRs?: number
}

const SECTION_IDS = {
  cropTrend: 'section-crop-trend',
  weeklyReports: 'section-weekly-reports',
  plantationComparison: 'section-plantation-comparison',
  tunnelHealth: 'section-tunnel-health',
  recommendations: 'section-recommendations',
  actionItems: 'section-action-items',
  riskAlerts: 'section-risk-alerts',
} as const
type SectionKey = keyof typeof SECTION_IDS

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

export function HartiMarketClient() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [bulletinMeta, setBulletinMeta] = useState<BulletinMeta | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<WeeklyReportEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set())

  function toggleSection(key: SectionKey) {
    // Uses the functional updater form so each toggle is computed from the
    // latest state rather than a closure snapshot - with a plain "new
    // Set(openSections)" snapshot, several toggles landing in the same React
    // batch (e.g. opening multiple sections in quick succession) would each
    // start from the same stale set and overwrite each other, leaving only
    // the last toggle applied.
    let willOpen = false
    setOpenSections((prev) => {
      const next = new Set(prev)
      willOpen = !prev.has(key)
      if (willOpen) next.add(key)
      else next.delete(key)
      return next
    })
    if (willOpen) {
      requestAnimationFrame(() => {
        document.getElementById(SECTION_IDS[key])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/harti-analysis/weekly-history?limit=500')
      const data = await res.json()
      if (res.ok) setHistory(data.weeks || [])
    } catch { /* history is a nice-to-have - ignore failures */ } finally {
      setHistoryLoading(false)
    }
  }

  async function runAnalysis() {
    setStatus('loading')
    setError('')
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

      setBulletinMeta(marketData.bulletinMeta)
      const merged: Analysis = {
        hartiSummary: marketData.analysis.hartiSummary,
        cropMarketTrends: marketData.analysis.cropMarketTrends,
        plantationVsMarket: marketData.analysis.plantationVsMarket,
        tunnelHealthScores: tunnelData.analysis.tunnelHealthScores,
        tunnels: tunnelData.analysis.tunnels,
        actionItems: [...marketData.analysis.actionItems, ...tunnelData.analysis.actionItems],
        riskAlerts: [...marketData.analysis.riskAlerts, ...tunnelData.analysis.riskAlerts],
      }
      setAnalysis(merged)
      setStatus('success')
      loadHistory()

      // Persist the full merged (market + tunnel) analysis for this week so
      // the Weekly Reports archive has the complete picture - the Monday
      // cron only has the market half (tunnel photos live in this browser's
      // localStorage), so this enriches that week's saved record whenever
      // someone actually views the page.
      if (marketData.bulletinMeta?.weekStart && marketData.bulletinMeta?.weekEnd) {
        fetch('/api/harti-analysis/weekly-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStart: marketData.bulletinMeta.weekStart,
            weekEnd: marketData.bulletinMeta.weekEnd,
            analysis: merged,
          }),
        }).catch(() => { /* best-effort - saveWarning banner already covers persistence failures */ })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
      setStatus('error')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the initial analysis fetch on mount, not deriving state
    runAnalysis()
    loadHistory()
  }, [])

  // --- Dashboard summary card stats, all derived from the real analysis/history above ---
  const dash = (value: string) => (analysis ? value : '—')

  const cropMarketTrends = analysis?.cropMarketTrends ?? []
  const primaryTrend = cropMarketTrends[0]
  const trendLabel = primaryTrend ? (primaryTrend.trend === 'up' ? 'Rising' : primaryTrend.trend === 'down' ? 'Falling' : 'Stable') : '—'
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
          Food Commodities Bulletin - fetched live and regenerated automatically every Monday, with history saved week
          by week. HARTI publishes no market price data for Moringa, so it is shown with our real plantation data
          only, not an invented trend. All health/risk analysis below is AI-generated from real data (tunnel photo
          logs, financials, HARTI figures) - treat it as a decision aid, not a substitute for field inspection.
        </p>
      </Card>

      {bulletinMeta?.usedFallback && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-xs text-amber-800">
            Could not fetch this week&apos;s live HARTI bulletin ({bulletinMeta.fallbackReason || 'unknown error'}) -
            showing the last successfully saved week ({formatDate(bulletinMeta.weekStart)} - {formatDate(bulletinMeta.weekEnd)}) instead of inventing numbers.
          </p>
        </Card>
      )}

      {bulletinMeta?.saveWarning && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-xs text-amber-800">{bulletinMeta.saveWarning} - the analysis above is accurate but won&apos;t appear in Weekly Reports until this is fixed.</p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <a
          href={bulletinMeta?.sourceUrl || WEEKLY_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          View HARTI Market Information <ExternalLink size={14} />
        </a>
        <button
          onClick={runAnalysis}
          disabled={status === 'loading'}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <RefreshCw size={15} className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {status === 'loading' && !analysis && (
        <Card>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
            <Loader2 size={16} className="animate-spin" /> Running AI analysis against HARTI market data...
          </div>
        </Card>
      )}

      {status === 'error' && (
        <Card className="border-status-critical/30 bg-status-critical/5">
          <p className="text-sm text-status-critical">{error}</p>
        </Card>
      )}

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardSummaryCard
          icon={TrendIcon}
          title="Crop Wise Market Trend"
          active={openSections.has('cropTrend')}
          onClick={() => toggleSection('cropTrend')}
          tone={primaryTrend?.trend === 'down' ? 'critical' : 'brand'}
          stats={[
            { label: 'Crops Tracked', value: dash(`${cropMarketTrends.length}`) },
            { label: "Today's Movement", value: primaryTrend ? `${primaryTrend.changePct > 0 ? '+' : ''}${primaryTrend.changePct}%` : '—' },
            { label: 'Overall Trend', value: trendLabel },
          ]}
        />
        <DashboardSummaryCard
          icon={FileText}
          title="Weekly Reports"
          active={openSections.has('weeklyReports')}
          onClick={() => toggleSection('weeklyReports')}
          tone="earth"
          stats={[
            { label: 'Latest Report', value: latestReportWeekNumber ? `Week ${String(latestReportWeekNumber).padStart(2, '0')}` : 'None yet' },
            { label: 'Last Generated', value: latestReport ? formatDate(latestReport.generatedAt.slice(0, 10)) : '—' },
          ]}
        />
        <DashboardSummaryCard
          icon={Scale}
          title="Plantation vs Market"
          active={openSections.has('plantationComparison')}
          onClick={() => toggleSection('plantationComparison')}
          stats={[
            { label: 'Market Price', value: bulletinMeta?.wholesaleAvgThisWeekRs != null ? `Rs ${Math.round(bulletinMeta.wholesaleAvgThisWeekRs)}/kg` : '—' },
            { label: 'Crops Compared', value: dash(`${plantationVsMarket.length}`) },
            { label: 'Misaligned', value: dash(`${misalignedCount}`) },
          ]}
        />
        <DashboardSummaryCard
          icon={HeartPulse}
          title="Tunnel Health Score"
          active={openSections.has('tunnelHealth')}
          onClick={() => toggleSection('tunnelHealth')}
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
          active={openSections.has('recommendations')}
          onClick={() => toggleSection('recommendations')}
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
          active={openSections.has('actionItems')}
          onClick={() => toggleSection('actionItems')}
          stats={[
            { label: 'Pending', value: dash(`${actionItems.length}`) },
            { label: 'In Progress', value: dash('0') },
            { label: 'Completed', value: dash('0') },
          ]}
        />
        <DashboardSummaryCard
          icon={AlertTriangle}
          title="Risk Alerts"
          active={openSections.has('riskAlerts')}
          onClick={() => toggleSection('riskAlerts')}
          tone={criticalAlertCount > 0 ? 'critical' : riskAlerts.length > 0 ? 'warn' : 'brand'}
          stats={[
            { label: 'Active', value: dash(`${riskAlerts.length}`) },
            { label: 'Critical', value: dash(`${criticalAlertCount}`) },
            { label: 'Medium', value: dash(`${mediumAlertCount}`) },
          ]}
        />
      </div>

      {openSections.size === 0 && (
        <p className="text-center text-xs text-brand-700/40">Click a card above to see its details.</p>
      )}

      {/* Detail sections - same order as the cards above */}
      <CollapsibleSection id={SECTION_IDS.cropTrend} title="Crop Wise Market Trend" open={openSections.has('cropTrend')} onToggle={() => toggleSection('cropTrend')}>
        {analysis && (
          <MarketTrendSection
            analysis={analysis}
            marketSummarySubtitle={
              bulletinMeta
                ? `Weekly Food Commodities Bulletin - Week of ${formatDate(bulletinMeta.weekStart)} to ${formatDate(bulletinMeta.weekEnd)}${bulletinMeta.bulletinVolume ? ` (Vol. ${bulletinMeta.bulletinVolume}${bulletinMeta.bulletinIssue ? `, No. ${bulletinMeta.bulletinIssue}` : ''})` : ''}`
                : 'Weekly Food Commodities Bulletin'
            }
          />
        )}
        <PassionFruitPriceChart />
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.weeklyReports} title="Weekly Reports" open={openSections.has('weeklyReports')} onToggle={() => toggleSection('weeklyReports')}>
        <WeeklyReportsSection history={history} loading={historyLoading} />
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.plantationComparison} title="Plantation vs Market Comparison" open={openSections.has('plantationComparison')} onToggle={() => toggleSection('plantationComparison')}>
        {analysis && <PlantationComparisonSection analysis={analysis} />}
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.tunnelHealth} title="Tunnel Health Score" open={openSections.has('tunnelHealth')} onToggle={() => toggleSection('tunnelHealth')}>
        {analysis && <TunnelHealthSection analysis={analysis} />}
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.recommendations} title="AI Recommendations" open={openSections.has('recommendations')} onToggle={() => toggleSection('recommendations')}>
        {analysis && <RecommendationsSection analysis={analysis} />}
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.actionItems} title="Action Items" open={openSections.has('actionItems')} onToggle={() => toggleSection('actionItems')}>
        {analysis && <ActionItemsSection analysis={analysis} />}
      </CollapsibleSection>

      <CollapsibleSection id={SECTION_IDS.riskAlerts} title="Risk Alerts" open={openSections.has('riskAlerts')} onToggle={() => toggleSection('riskAlerts')}>
        {analysis && <RiskAlertsSection analysis={analysis} />}
      </CollapsibleSection>

      {analysis && (
        <p className="text-center text-[11px] text-brand-700/40">
          Analyzed {formatDate(new Date().toISOString().slice(0, 10))} - AI-generated, verify critical actions in the field before acting.
        </p>
      )}
    </div>
  )
}
