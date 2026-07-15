'use client'

import { useEffect, useState } from 'react'
import {
  RefreshCw, ExternalLink, Loader2, CalendarClock,
  LayoutDashboard, TrendingUp, Scale, Tent, LineChart, Compass, FileText,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { formatDate } from '@/lib/format'
import { useRole } from '@/lib/role-context'
import type { TunnelPhotoEntry } from '@/lib/types'
import type { HartiAnalysis } from '@/lib/harti-types'
import { WeeklyReportsSection, type WeeklyReportEntry } from './WeeklyReportsSection'
import { MarketTrendSection, PlantationComparisonSection, TunnelHealthSection, RecommendationsSection } from './AnalysisView'
import { ExecutiveSummaryTab } from './ExecutiveSummaryTab'
import { MarketOpportunitiesTab } from './MarketOpportunitiesTab'
import { PassionFruitPriceChart } from './PassionFruitPriceChart'
import { TabBar, type TabDef } from './TabBar'

const WEEKLY_SOURCE_URL = 'https://www.harti.gov.lk/weekly-price.php'
const STORAGE_PREFIX = 'sfc-tunnel-photos-'

type TabKey = 'executiveSummary' | 'cropTrend' | 'plantationComparison' | 'tunnelAnalysis' | 'priceForecast' | 'marketOpportunities' | 'weeklyReports'

const TABS: TabDef<TabKey>[] = [
  { key: 'executiveSummary', label: 'Executive Summary', icon: LayoutDashboard },
  { key: 'cropTrend', label: 'Crop Wise Market Trend', icon: TrendingUp },
  { key: 'plantationComparison', label: 'Plantation Market Comparison', icon: Scale },
  { key: 'tunnelAnalysis', label: 'Tunnel Crop Analysis', icon: Tent },
  { key: 'priceForecast', label: 'Price Forecast', icon: LineChart },
  { key: 'marketOpportunities', label: 'Market Opportunities', icon: Compass },
  { key: 'weeklyReports', label: 'Weekly Reports', icon: FileText },
]

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
  const { role } = useRole()
  const isAdmin = role === 'Admin'

  const [history, setHistory] = useState<WeeklyReportEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('executiveSummary')

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

  // The most recently saved report - shown as "this week's" snapshot. Not
  // matched strictly against today's calendar date: HARTI's own weekly
  // bulletin can lag the calendar by a while (confirmed - their site can go
  // a month or more between publishes), so requiring the report's exact
  // date range to contain today would leave the tabs empty indefinitely
  // even right after a fresh, real save. The Monday cron (or an admin's
  // manual run) is what keeps this current, not a client-side date check.
  const currentWeekReport = history.length ? [...history].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0] : null
  const analysis = currentWeekReport?.analysis ?? null

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

  const bulletinSubtitle = currentWeekReport
    ? `Weekly Food Commodities Bulletin - Week of ${formatDate(currentWeekReport.weekStart)} to ${formatDate(currentWeekReport.weekEnd)}`
    : 'Weekly Food Commodities Bulletin'

  return (
    <div className="-mt-2">
      {/* Hero banner - real aerial photo of the estate (same image used on
          the login page), not a stock/generic image */}
      <div className="relative -mx-4 -mt-4 mb-4 h-32 overflow-hidden sm:-mx-6 sm:-mt-6 sm:h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/estate-photo.jpg"
          alt="Aerial view of the Silk Food Ceylon estate - tunnels, thatched structures and crop plots"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(12,27,21,0.88) 0%, rgba(21,128,61,0.55) 55%, rgba(12,27,21,0.35) 100%)' }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Silk Food Ceylon</p>
          <p className="mt-1 max-w-xl text-xs text-white/85 sm:text-sm">
            Real HARTI weekly bulletin data compared against our 5 greenhouse tunnels and open-field crops.
          </p>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        <Card className="border-brand-200 bg-brand-50">
          <p className="text-xs text-brand-700/70">
            Scoped to our 5 greenhouse tunnels (Alpha, Bravo, Charlie, Oregano, Echo), the Passion Fruit plot, and the
            Moringa plot against HARTI&apos;s (Hector Kobbekaduwa Agrarian Research and Training Institute) real
            WEEKLY Food Commodities Bulletin. Analysis runs automatically every Monday and is saved as a Weekly
            Report - this page always shows the latest saved snapshot rather than calling the AI on every visit.
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
      </div>

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="space-y-6 pt-6">
        {historyLoading && (
          <Card>
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          </Card>
        )}

        {!historyLoading && !analysis && activeTab !== 'weeklyReports' && (
          <Card className="border-dashed border-brand-200 bg-brand-50/50">
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CalendarClock size={22} className="text-brand-600" />
              <p className="text-sm font-medium text-brand-800">No report generated for this week yet.</p>
              <p className="text-xs text-brand-700/60">Next scheduled analysis: Monday 08:00 AM.</p>
            </div>
          </Card>
        )}

        {!historyLoading && analysis && (
          <>
            {activeTab === 'executiveSummary' && <ExecutiveSummaryTab analysis={analysis} subtitle={bulletinSubtitle} />}

            {activeTab === 'cropTrend' && (
              <div className="harti-tab-content space-y-6">
                <MarketTrendSection analysis={analysis} marketSummarySubtitle={bulletinSubtitle} />
              </div>
            )}

            {activeTab === 'plantationComparison' && (
              <div className="harti-tab-content space-y-6">
                <PlantationComparisonSection analysis={analysis} />
              </div>
            )}

            {activeTab === 'tunnelAnalysis' && (
              <div className="harti-tab-content space-y-6">
                <TunnelHealthSection analysis={analysis} />
                <RecommendationsSection analysis={analysis} />
              </div>
            )}

            {activeTab === 'priceForecast' && (
              <div className="harti-tab-content space-y-6">
                <Card className="border-brand-200 bg-brand-50">
                  <p className="text-xs text-brand-700/70">
                    Real Colombo wholesale Passion Fruit prices saved week by week - a historical trend, not a
                    predictive forecast (we don&apos;t generate price predictions).
                  </p>
                </Card>
                <PassionFruitPriceChart />
              </div>
            )}

            {activeTab === 'marketOpportunities' && <MarketOpportunitiesTab analysis={analysis} />}
          </>
        )}

        {activeTab === 'weeklyReports' && (
          <div className="harti-tab-content">
            <WeeklyReportsSection history={history} loading={historyLoading} />
          </div>
        )}
      </div>
    </div>
  )
}
