import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, ListChecks, ShieldAlert, Tent, HeartPulse,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { ScoreRing } from '@/components/ui/ProgressBar'
import { SeverityBadge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import type { Severity } from '@/lib/types'
import type { HartiAnalysis } from '@/lib/harti-types'

function toSeverity(value: string): Severity {
  const v = value.toLowerCase()
  return v === 'low' || v === 'medium' || v === 'high' || v === 'critical' ? v : 'medium'
}

// Renders the full HARTI market + tunnel analysis (Market Summary through
// Risk Alerts) - shared between the live dashboard and a saved Weekly
// Reports snapshot, so both render identically from the same Analysis shape.
//
// Tunnel/action/risk fields default to [] because a report saved by the
// Monday cron only has the market half (tunnel photo logs live in browser
// localStorage, which the server-side cron can't read) - those sections
// just render empty rather than crashing until a real page visit enriches
// that week's saved record with the full picture.
export function AnalysisView({
  analysis,
  marketSummarySubtitle,
  footerNote,
}: {
  analysis: HartiAnalysis
  marketSummarySubtitle: string
  footerNote: string
}) {
  const cropMarketTrends = analysis.cropMarketTrends ?? []
  const plantationVsMarket = analysis.plantationVsMarket ?? []
  const tunnelHealthScores = analysis.tunnelHealthScores ?? []
  const tunnels = analysis.tunnels ?? []
  const actionItems = analysis.actionItems ?? []
  const riskAlerts = analysis.riskAlerts ?? []

  const passionTrend = cropMarketTrends.find((t) => t.cropName === 'Passion Fruit') ?? cropMarketTrends[0]
  const scoredTunnels = tunnelHealthScores.filter((t) => t.dataAvailable)
  const avgTunnelHealth = scoredTunnels.length
    ? Math.round(scoredTunnels.reduce((sum, t) => sum + t.score, 0) / scoredTunnels.length)
    : null
  const criticalRiskCount = riskAlerts.filter((r) => r.severity.toLowerCase() === 'critical').length
  const TrendIcon = passionTrend ? (passionTrend.trend === 'up' ? TrendingUp : passionTrend.trend === 'down' ? TrendingDown : Minus) : Minus

  return (
    <>
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {passionTrend && (
          <StatCard
            label="Passion Fruit Trend"
            value={`${passionTrend.changePct > 0 ? '+' : ''}${passionTrend.changePct}%`}
            icon={TrendIcon}
            hint="Week-on-week"
            tone={passionTrend.trend === 'up' ? 'brand' : passionTrend.trend === 'down' ? 'critical' : 'earth'}
          />
        )}
        <StatCard label="Tunnels Monitored" value={`${tunnelHealthScores.length}`} icon={Tent} tone="earth" />
        <StatCard
          label="Avg Tunnel Health"
          value={avgTunnelHealth !== null ? `${avgTunnelHealth}%` : 'No data'}
          icon={HeartPulse}
          hint={`${scoredTunnels.length} of ${tunnelHealthScores.length} with photo data`}
        />
        <StatCard label="Open Action Items" value={`${actionItems.length}`} icon={ListChecks} tone="earth" />
        <StatCard
          label="Risk Alerts"
          value={`${riskAlerts.length}`}
          icon={AlertTriangle}
          tone={criticalRiskCount > 0 ? 'critical' : riskAlerts.length > 0 ? 'warn' : 'brand'}
          hint={criticalRiskCount > 0 ? `${criticalRiskCount} critical` : undefined}
        />
      </div>

      {/* HARTI Market Summary */}
      <Card>
        <CardHeader title="HARTI Market Summary" subtitle={marketSummarySubtitle} />
        <p className="text-sm text-brand-700/80">{analysis.hartiSummary}</p>
      </Card>

      {/* Crop-wise Market Trend */}
      <Card>
        <CardHeader title="Crop-wise Market Trend" subtitle="Based on real HARTI wholesale/retail pricing" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cropMarketTrends.map((t) => {
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
          {plantationVsMarket.map((p) => (
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
          {tunnelHealthScores.map((t) => (
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
          {tunnels.map((t) => (
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
        {actionItems.length === 0 ? (
          <p className="text-sm text-brand-700/40">No action items - everything looks on track.</p>
        ) : (
          <ul className="space-y-2">
            {actionItems.map((a, i) => (
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
        {riskAlerts.length === 0 ? (
          <p className="text-sm text-brand-700/40">No risk alerts right now.</p>
        ) : (
          <ul className="space-y-2">
            {riskAlerts.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-status-critical/5 p-3 text-sm">
                <span className="flex items-start gap-2 text-brand-800"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-critical" /> {r.description}{r.tunnelName ? ` (${r.tunnelName})` : ''}</span>
                <SeverityBadge severity={toSeverity(r.severity)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-center text-[11px] text-brand-700/40">
        {footerNote} · <ShieldAlert size={10} className="inline" /> AI-generated - verify critical actions in the field before acting.
      </p>
    </>
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
