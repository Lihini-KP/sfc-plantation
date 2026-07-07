import { Wheat, Coins, TrendingDown, TrendingUp, CalendarClock, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { FinanceTrendChart } from '@/components/dashboard/FinanceTrendChart'
import { HibiscusHarvestChart } from '@/components/harvests/HibiscusHarvestChart'
import { cropSales, totalIncomeByCrop } from '@/lib/mock-data/cropSales'
import { recentMonthlyDetail, totalIncome, totalExpenses } from '@/lib/mock-data/finance'
import { hibiscusHarvestLog, totalHibiscusHarvested } from '@/lib/mock-data/hibiscusHarvestLog'
import { projectHarvestPlan } from '@/lib/harvest-plan'
import { formatCurrency, formatDate } from '@/lib/format'

export default function HarvestsPage() {
  const byCrop = totalIncomeByCrop()
  const recordedIncome = cropSales.reduce((s, r) => s + r.incomeRs, 0)
  const months = [...new Set(cropSales.map((r) => r.month))]
  const hibiscusPlan = projectHarvestPlan(hibiscusHarvestLog.map((e) => e.date))
  const lowConfidenceCount = hibiscusHarvestLog.filter((e) => e.confidence === 'low').length

  return (
    <PageContainer title="Harvest & Sales Income">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Figures on this page are transcribed directly from the estate&apos;s <strong>P&amp;L Cultivation</strong> Google Sheet
          (real recorded sales, {months[0]} - {months[months.length - 1]}). Quantities are kept in the units as recorded in the
          source (kg / g / bundle counts) rather than normalized. Per-plot harvest tracking (which zone each sale came from)
          isn&apos;t in the source sheet yet, so figures here are estate-wide, not broken down by map zone.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Recorded Sales Income" value={formatCurrency(recordedIncome)} icon={Wheat} />
        <StatCard label="Total Income (16mo)" value={formatCurrency(totalIncome())} icon={Coins} />
        <StatCard label="Total Expenses (16mo)" value={formatCurrency(totalExpenses())} icon={TrendingUp} tone="warn" />
        <StatCard label="Distinct Crops Sold" value={`${byCrop.length}`} icon={TrendingDown} tone="earth" />
      </div>

      <Card>
        <CardHeader title="Income vs Expenses" subtitle="Full recorded history from the P&L sheet" />
        <FinanceTrendChart />
      </Card>

      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          The Hibiscus harvest log below is transcribed from Richard&apos;s handwritten weighing ledger (paper record, not a
          spreadsheet). Dates and kg weights are transcribed directly; {lowConfidenceCount} entries are marked{' '}
          <span className="font-medium text-status-attention">low confidence</span> where the handwriting was ambiguous and
          should be spot-checked against the physical ledger. Two additional columns in the ledger (Sinhala text, likely
          collector name and grade/type) weren&apos;t transcribed - not legible enough to read reliably.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Hibiscus Harvest Log"
            subtitle={`${hibiscusHarvestLog.length} weighing entries, ${formatDate(hibiscusHarvestLog[0].date)} - ${formatDate(hibiscusHarvestLog[hibiscusHarvestLog.length - 1].date)} - Richard's ledger`}
          />
          <HibiscusHarvestChart />
          <div className="mt-3 max-h-64 overflow-y-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {hibiscusHarvestLog.map((e) => (
                  <tr key={e.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-1.5 pr-4 text-brand-700/70">{formatDate(e.date)}</td>
                    <td className="py-1.5 text-brand-800">
                      {e.quantityKg} kg
                      {e.confidence === 'low' && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-status-attention">
                          <AlertTriangle size={9} /> verify
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Harvesting Plan"
            subtitle="Projected from real logged intervals"
            action={<CalendarClock size={18} className="text-brand-600" />}
          />
          <div className="rounded-xl bg-brand-50 p-3 text-center">
            <p className="text-2xl font-semibold text-brand-800">{totalHibiscusHarvested().toFixed(2)} kg</p>
            <p className="text-[11px] text-brand-700/50">Total harvested (logged)</p>
          </div>
          {hibiscusPlan ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-brand-100 p-2.5">
                  <p className="text-sm font-semibold text-brand-800">{hibiscusPlan.averageIntervalDays}d</p>
                  <p className="text-[10px] text-brand-700/50">Avg. interval</p>
                </div>
                <div className="rounded-xl border border-brand-100 p-2.5">
                  <p className="text-sm font-semibold text-brand-800">{hibiscusPlan.minIntervalDays}-{hibiscusPlan.maxIntervalDays}d</p>
                  <p className="text-[10px] text-brand-700/50">Range seen</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-brand-700/70">Next Projected Harvests</p>
              <ul className="mt-1 space-y-1">
                {hibiscusPlan.nextProjectedDates.map((d) => (
                  <li key={d} className="flex items-center justify-between rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs text-brand-700/80">
                    {formatDate(d)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-brand-700/40">
                Based on {hibiscusPlan.sampleSize} logged intervals from the real ledger - a simple average, not a growth
                model. Refine once more history accumulates.
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-brand-700/50">Not enough data points to project a plan yet.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recorded Sales by Month" subtitle={`${cropSales.length} recorded line items`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
                  <th className="pb-2 pr-4">Month</th>
                  <th className="pb-2 pr-4">Crop</th>
                  <th className="pb-2 pr-4">Quantity</th>
                  <th className="pb-2">Income</th>
                </tr>
              </thead>
              <tbody>
                {cropSales.map((r) => (
                  <tr key={r.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2 pr-4 text-brand-700/70">{r.month}</td>
                    <td className="py-2 pr-4 font-medium text-brand-800">{r.cropName}</td>
                    <td className="py-2 pr-4 text-brand-700/70">{r.quantity}</td>
                    <td className="py-2 text-brand-800">{formatCurrency(r.incomeRs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Total Income by Crop" subtitle="Jan - May 2026" />
          <div className="space-y-2">
            {byCrop.map((c) => (
              <div key={c.cropName} className="flex items-center justify-between rounded-xl border border-brand-100 p-2.5">
                <span className="text-sm text-brand-800">{c.cropName}</span>
                <span className="text-sm font-medium text-brand-800">{formatCurrency(c.incomeRs)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Monthly Profit / Loss (recent)" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
                <th className="pb-2 pr-4">Month</th>
                <th className="pb-2 pr-4">Income</th>
                <th className="pb-2 pr-4">Expenses</th>
                <th className="pb-2">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {recentMonthlyDetail.map((m) => (
                <tr key={m.month} className="border-b border-brand-50 last:border-0">
                  <td className="py-2 pr-4 text-brand-700/70">{m.month}</td>
                  <td className="py-2 pr-4 text-brand-800">{formatCurrency(m.totalIncome)}</td>
                  <td className="py-2 pr-4 text-brand-800">{formatCurrency(m.totalExpenses)}</td>
                  <td className={`py-2 font-medium ${m.profitLoss >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                    {formatCurrency(m.profitLoss)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentMonthlyDetail.some((m) => m.expenseNote) && (
            <p className="mt-2 text-[11px] text-brand-700/40">
              {recentMonthlyDetail.find((m) => m.expenseNote)?.expenseNote}
            </p>
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
