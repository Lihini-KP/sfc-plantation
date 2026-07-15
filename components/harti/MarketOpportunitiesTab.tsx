import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import type { HartiAnalysis } from '@/lib/harti-types'

// Re-presents the same real cropMarketTrends + plantationVsMarket fields
// already generated for the Crop Trend and Plantation Comparison tabs,
// through an "opportunity vs risk" lens - no new AI call, no new numbers,
// just a different read of the same real data.
export function MarketOpportunitiesTab({ analysis }: { analysis: HartiAnalysis }) {
  const trends = analysis.cropMarketTrends ?? []
  const comparisons = analysis.plantationVsMarket ?? []

  return (
    <div className="harti-tab-content space-y-6">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Reframes the same real HARTI market trend and plantation comparison data from the other tabs to highlight
          where market conditions favor us versus where they don&apos;t - not a separate prediction or new analysis.
        </p>
      </Card>

      <Card>
        <CardHeader title="Where the Market Favors Us" subtitle="Crops with a rising or stable real HARTI price trend" />
        {trends.filter((t) => t.trend !== 'down').length === 0 ? (
          <p className="text-sm text-brand-700/40">No crops currently show a favorable price trend.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trends.filter((t) => t.trend !== 'down').map((t) => {
              const Icon = t.trend === 'up' ? TrendingUp : Minus
              return (
                <div key={t.cropName} className="rounded-xl border border-status-healthy/30 bg-status-healthy/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-800">{t.cropName}</span>
                    <span className="flex items-center gap-1 rounded-full bg-status-healthy/10 px-2 py-0.5 text-xs font-medium text-status-healthy">
                      <Icon size={12} /> {t.changePct > 0 ? '+' : ''}{t.changePct}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-700/60">{t.note}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Where the Market Is Working Against Us" subtitle="Crops with a falling real HARTI price trend" />
        {trends.filter((t) => t.trend === 'down').length === 0 ? (
          <p className="text-sm text-brand-700/40">No crops currently show a declining price trend.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trends.filter((t) => t.trend === 'down').map((t) => (
              <div key={t.cropName} className="rounded-xl border border-status-critical/30 bg-status-critical/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-800">{t.cropName}</span>
                  <span className="flex items-center gap-1 rounded-full bg-status-critical/10 px-2 py-0.5 text-xs font-medium text-status-critical">
                    <TrendingDown size={12} /> {t.changePct}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-700/60">{t.note}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Alignment Notes" subtitle="How well our plot conditions match the market opportunity" />
        <div className="space-y-2">
          {comparisons.map((c) => (
            <div key={c.cropName} className="rounded-xl bg-brand-50 p-3 text-sm">
              <p className="font-semibold text-brand-800">{c.cropName}</p>
              <p className="mt-1 text-xs text-brand-700">{c.alignment}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
