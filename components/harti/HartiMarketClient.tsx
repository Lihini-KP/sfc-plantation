'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, AlertTriangle,
  Sparkles, ListChecks, ShieldAlert, Loader2,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ProgressBar'
import { SeverityBadge } from '@/components/ui/Badge'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { formatDate } from '@/lib/format'
import type { Severity, TunnelPhotoEntry } from '@/lib/types'

const WEEKLY_SOURCE_URL = 'https://www.harti.gov.lk/weekly-price.php'

interface CropMarketTrend {
  cropName: string
  trend: 'up' | 'down' | 'stable'
  changePct: number
  note: string
}
interface PlantationVsMarket {
  cropName: string
  ourStatus: string
  marketStatus: string
  alignment: string
}
interface TunnelHealthScore {
  tunnelId: string
  tunnelName: string
  score: number
  dataAvailable: boolean
  summary: string
}
interface TunnelIssue {
  issue: string
  rootCauses: string[]
  correctiveActions: string[]
  preventiveMeasures: string[]
  priority: string
  expectedImpact: string
}
interface TunnelAnalysis {
  tunnelId: string
  tunnelName: string
  cropName: string
  currentHealth: string
  growthAbnormalities: string[]
  pestDiseaseSymptoms: string[]
  environmentalIssues: string[]
  yieldRisk: string
  issues: TunnelIssue[]
}
interface ActionItem {
  description: string
  priority: string
  tunnelName: string | null
}
interface RiskAlert {
  description: string
  severity: string
  tunnelName: string | null
}
interface Analysis {
  hartiSummary: string
  cropMarketTrends: CropMarketTrend[]
  plantationVsMarket: PlantationVsMarket[]
  tunnelHealthScores: TunnelHealthScore[]
  tunnels: TunnelAnalysis[]
  actionItems: ActionItem[]
  riskAlerts: RiskAlert[]
}
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

function toSeverity(value: string): Severity {
  const v = value.toLowerCase()
  return v === 'low' || v === 'medium' || v === 'high' || v === 'critical' ? v : 'medium'
}

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
      setAnalysis({
        hartiSummary: marketData.analysis.hartiSummary,
        cropMarketTrends: marketData.analysis.cropMarketTrends,
        plantationVsMarket: marketData.analysis.plantationVsMarket,
        tunnelHealthScores: tunnelData.analysis.tunnelHealthScores,
        tunnels: tunnelData.analysis.tunnels,
        actionItems: [...marketData.analysis.actionItems, ...tunnelData.analysis.actionItems],
        riskAlerts: [...marketData.analysis.riskAlerts, ...tunnelData.analysis.riskAlerts],
      })
      setStatus('success')
      loadHistory()
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
        <>
          {/* HARTI Market Summary */}
          <Card>
            <CardHeader
              title="HARTI Market Summary"
              subtitle={
                bulletinMeta
                  ? `Weekly Food Commodities Bulletin - Week of ${formatDate(bulletinMeta.weekStart)} to ${formatDate(bulletinMeta.weekEnd)}${bulletinMeta.bulletinVolume ? ` (Vol. ${bulletinMeta.bulletinVolume}${bulletinMeta.bulletinIssue ? `, No. ${bulletinMeta.bulletinIssue}` : ''})` : ''}`
                  : 'Weekly Food Commodities Bulletin'
              }
            />
            <p className="text-sm text-brand-700/80">{analysis.hartiSummary}</p>
          </Card>

          {/* Crop-wise Market Trend */}
          <Card>
            <CardHeader title="Crop-wise Market Trend" subtitle="Based on real HARTI wholesale/retail pricing" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.cropMarketTrends.map((t) => {
                const Icon = t.trend === 'up' ? TrendingUp : t.trend === 'down' ? TrendingDown : Minus
                const tone = t.trend === 'up' ? 'text-status-healthy bg-status-healthy/10' : t.trend === 'down' ? 'text-status-critical bg-status-critical/10' : 'text-brand-700/60 bg-brand-50'
                return (
                  <div key={t.cropName} className="rounded-xl border border-brand-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-800">{t.cropName}</span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
                        <Icon size={12} /> {t.changePct > 0 ? '+' : ''}{t.changePct}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-700/60">{t.note}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Plantation vs Market Comparison */}
          <Card>
            <CardHeader title="Plantation vs Market Comparison" subtitle="How our crops compare to the national picture" />
            <div className="space-y-2">
              {analysis.plantationVsMarket.map((p) => (
                <div key={p.cropName} className="rounded-xl bg-brand-50 p-3 text-sm">
                  <p className="font-semibold text-brand-800">{p.cropName}</p>
                  <p className="mt-1 text-xs text-brand-700/70"><span className="font-medium">Our status:</span> {p.ourStatus}</p>
                  <p className="text-xs text-brand-700/70"><span className="font-medium">Market status:</span> {p.marketStatus}</p>
                  <p className="mt-1 text-xs text-brand-700">{p.alignment}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tunnel Health Score */}
          <Card>
            <CardHeader title="Tunnel Health Score" subtitle="Derived from real tunnel photo inspections and financials" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.tunnelHealthScores.map((t) => (
                <div key={t.tunnelId} className="flex items-center gap-3 rounded-xl border border-brand-100 p-3">
                  {t.dataAvailable ? (
                    <ScoreRing value={t.score} />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-brand-200 text-[10px] font-medium text-brand-700/40">
                      No data
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-brand-800">{t.tunnelName}</p>
                    <p className="text-xs text-brand-700/60">{t.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Recommendations (per-tunnel deep dive) */}
          <Card>
            <CardHeader title="AI Recommendations" subtitle="Per-tunnel diagnostic against HARTI and our own data" />
            <div className="space-y-4">
              {analysis.tunnels.map((t) => (
                <div key={t.tunnelId} className="rounded-xl border border-brand-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-800">{t.tunnelName} - {t.cropName}</p>
                    <SeverityBadge severity={toSeverity(t.yieldRisk)} />
                  </div>
                  <p className="mt-1 text-xs text-brand-700/70">{t.currentHealth}</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <MiniList title="Growth Abnormalities" items={t.growthAbnormalities} />
                    <MiniList title="Pest/Disease Symptoms" items={t.pestDiseaseSymptoms} />
                    <MiniList title="Environmental Issues" items={t.environmentalIssues} />
                  </div>
                  {t.issues.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {t.issues.map((issue) => (
                        <div key={issue.issue} className="rounded-lg bg-brand-50 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700"><Sparkles size={12} /> {issue.issue}</p>
                            <SeverityBadge severity={toSeverity(issue.priority)} />
                          </div>
                          <MiniList title="Root Causes" items={issue.rootCauses} compact />
                          <MiniList title="Corrective Actions" items={issue.correctiveActions} compact />
                          <MiniList title="Preventive Measures" items={issue.preventiveMeasures} compact />
                          <p className="mt-1 text-[11px] text-brand-700/60"><span className="font-medium">Expected impact if ignored:</span> {issue.expectedImpact}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader title="Action Items" subtitle="Prioritized tasks from the analysis above" />
            {analysis.actionItems.length === 0 ? (
              <p className="text-sm text-brand-700/40">No action items - everything looks on track.</p>
            ) : (
              <ul className="space-y-2">
                {analysis.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-brand-50 p-3 text-sm">
                    <span className="flex items-start gap-2 text-brand-800"><ListChecks size={15} className="mt-0.5 shrink-0" /> {a.description}{a.tunnelName ? ` (${a.tunnelName})` : ''}</span>
                    <SeverityBadge severity={toSeverity(a.priority)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Risk Alerts */}
          <Card>
            <CardHeader title="Risk Alerts" subtitle="Yield or health risks flagged by the analysis" />
            {analysis.riskAlerts.length === 0 ? (
              <p className="text-sm text-brand-700/40">No risk alerts right now.</p>
            ) : (
              <ul className="space-y-2">
                {analysis.riskAlerts.map((r, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-status-critical/5 p-3 text-sm">
                    <span className="flex items-start gap-2 text-brand-800"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-critical" /> {r.description}{r.tunnelName ? ` (${r.tunnelName})` : ''}</span>
                    <SeverityBadge severity={toSeverity(r.severity)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="text-center text-[11px] text-brand-700/40">
            Analyzed {formatDate(new Date().toISOString().slice(0, 10))} · <ShieldAlert size={10} className="inline" /> AI-generated - verify critical actions in the field before acting.
          </p>
        </>
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

function MiniList({ title, items, compact }: { title: string; items: string[]; compact?: boolean }) {
  if (items.length === 0) {
    return compact ? null : (
      <div>
        <p className="text-[11px] font-semibold text-brand-700/70">{title}</p>
        <p className="text-[11px] text-brand-700/40">None noted</p>
      </div>
    )
  }
  return (
    <div className={compact ? 'mt-1' : ''}>
      <p className="text-[11px] font-semibold text-brand-700/70">{title}</p>
      <ul className="text-[11px] text-brand-700/70">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  )
}
