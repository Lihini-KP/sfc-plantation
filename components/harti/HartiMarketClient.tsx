'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { formatDate } from '@/lib/format'
import type { TunnelPhotoEntry } from '@/lib/types'
import type { HartiAnalysis } from '@/lib/harti-types'
import { AnalysisView } from './AnalysisView'
import { PassionFruitPriceChart } from './PassionFruitPriceChart'

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
}
interface WeeklyHistoryEntry {
  weekStart: string
  weekEnd: string
  generatedAt: string
  analysis: Pick<Analysis, 'hartiSummary' | 'cropMarketTrends' | 'plantationVsMarket'>
}

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
  const [history, setHistory] = useState<WeeklyHistoryEntry[]>([])
  const [historyOpenWeek, setHistoryOpenWeek] = useState<string | null>(null)

  async function loadHistory() {
    try {
      const res = await fetch('/api/harti-analysis/weekly-history')
      const data = await res.json()
      if (res.ok) setHistory(data.weeks || [])
    } catch { /* history is a nice-to-have - ignore failures */ }
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
          <p className="text-xs text-amber-800">{bulletinMeta.saveWarning} - the analysis above is accurate but won&apos;t appear in Weekly History until this is fixed.</p>
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

      <PassionFruitPriceChart />

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

      {analysis && (
        <AnalysisView
          analysis={analysis}
          marketSummarySubtitle={
            bulletinMeta
              ? `Weekly Food Commodities Bulletin - Week of ${formatDate(bulletinMeta.weekStart)} to ${formatDate(bulletinMeta.weekEnd)}${bulletinMeta.bulletinVolume ? ` (Vol. ${bulletinMeta.bulletinVolume}${bulletinMeta.bulletinIssue ? `, No. ${bulletinMeta.bulletinIssue}` : ''})` : ''}`
              : 'Weekly Food Commodities Bulletin'
          }
          footerNote={`Analyzed ${formatDate(new Date().toISOString().slice(0, 10))}`}
        />
      )}

      {/* Weekly History */}
      {history.length > 0 && (
        <Card>
          <CardHeader title="Weekly History" subtitle="Saved Passion Fruit & Moringa analyses, one per HARTI bulletin week" />
          <div className="space-y-2">
            {history.map((h) => {
              const key = `${h.weekStart}_${h.weekEnd}`
              const open = historyOpenWeek === key
              return (
                <div key={key} className="rounded-xl border border-brand-100">
                  <button
                    onClick={() => setHistoryOpenWeek(open ? null : key)}
                    className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm"
                  >
                    <span className="font-medium text-brand-800">
                      Week of {formatDate(h.weekStart)} - {formatDate(h.weekEnd)}
                    </span>
                    <span className="text-xs text-brand-700/50">{open ? 'Hide' : 'View'}</span>
                  </button>
                  {open && (
                    <div className="space-y-3 border-t border-brand-100 p-3">
                      <p className="text-xs text-brand-700/80">{h.analysis.hartiSummary}</p>
                      <div className="space-y-1.5">
                        {h.analysis.plantationVsMarket.map((p) => (
                          <div key={p.cropName} className="rounded-lg bg-brand-50 p-2 text-xs">
                            <p className="font-semibold text-brand-800">{p.cropName}</p>
                            <p className="text-brand-700/70">{p.ourStatus}</p>
                            <p className="text-brand-700/70">{p.marketStatus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
