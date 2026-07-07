import { Leaf, TrendingUp, TrendingDown, Sprout } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { crops } from '@/lib/mock-data'
import { totalIncomeByCrop } from '@/lib/mock-data/cropSales'
import { greenhouses, totalGreenhouseRevenue, totalGreenhouseExpenses } from '@/lib/mock-data/greenhouses'
import { formatCurrency, formatDate } from '@/lib/format'

const annualPlanCropIds = new Set(['crop-hot-dragon', 'crop-muriya', 'crop-cucumber', 'crop-kakiri'])

export default function CropsPage() {
  const unmappedCrops = totalIncomeByCrop().filter(
    (sale) => !crops.some((c) => sale.cropName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase()))
  )

  return (
    <PageContainer title="Crop Management">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Income and planting/harvest dates below are real, transcribed from the P&amp;L Cultivation sheet and the Annual
          Crop Plan sheet. Per-crop cultivation cost is only available for the greenhouse tunnels (Hot Dragon, Muriya - see
          below), which is why only those show a Revenue/Expenses/Profit breakdown; other crops only track estate-wide
          expense totals (see Reports). Growth stage descriptions and schedules elsewhere are illustrative placeholders.
        </p>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {crops.map((crop) => {
          const yieldPct = crop.expectedYieldKg ? Math.round((crop.actualYieldKg / crop.expectedYieldKg) * 100) : 0
          return (
            <Card key={crop.id}>
              <CardHeader
                title={crop.name}
                subtitle={crop.variety}
                action={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Leaf size={17} /></span>}
              />
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <Field label="Plant Count" value={crop.plantCount > 0 ? crop.plantCount.toLocaleString() : 'Greenhouse (by area)'} />
                <Field label="Harvest Cycle" value={`${crop.harvestCycleDays} days`} />
                <Field label="Planting Date" value={formatDate(crop.plantingDate)} />
                <Field label="Expected Harvest" value={formatDate(crop.expectedHarvestDate)} />
                <Field label="Growth Stage" value={crop.growthStage} full />
                <Field label="Water Requirement" value={crop.waterRequirement} full />
                <Field label="Fertilizer Schedule" value={crop.fertilizerSchedule} full />
                <Field label="Pesticide Schedule" value={crop.pesticideSchedule} full />
              </dl>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-brand-700/60">
                  <span>Yield: {crop.actualYieldKg.toLocaleString()} / {crop.expectedYieldKg.toLocaleString()} kg</span>
                  <span>{yieldPct}%</span>
                </div>
                <div className="mt-1"><ProgressBar value={yieldPct} /></div>
              </div>

              {crop.costOfCultivation > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-50 p-2.5">
                    <p className="text-sm font-semibold text-brand-800">{formatCurrency(crop.revenue)}</p>
                    <p className="text-[11px] text-brand-700/50">Revenue</p>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-2.5">
                    <p className="text-sm font-semibold text-brand-800">{formatCurrency(crop.costOfCultivation)}</p>
                    <p className="text-[11px] text-brand-700/50">Expenses</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${crop.revenue - crop.costOfCultivation >= 0 ? 'bg-status-healthy/10' : 'bg-status-critical/10'}`}>
                    <p className={`flex items-center justify-center gap-1 text-sm font-semibold ${crop.revenue - crop.costOfCultivation >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                      {crop.revenue - crop.costOfCultivation >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {formatCurrency(Math.abs(crop.revenue - crop.costOfCultivation))}
                    </p>
                    <p className="text-[11px] text-brand-700/50">{crop.revenue - crop.costOfCultivation >= 0 ? 'Profit' : 'Loss'}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-brand-50 p-3 text-center">
                  <p className="text-lg font-semibold text-brand-800">{formatCurrency(crop.revenue)}</p>
                  <p className="text-[11px] text-brand-700/50">
                    {crop.revenue > 0
                      ? `Recorded income (${annualPlanCropIds.has(crop.id) ? 'Annual Crop Plan' : 'P&L sheet'})`
                      : 'No sales recorded yet'}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader
          title="Greenhouse Tunnels"
          subtitle="Real per-tunnel figures from the Annual Crop Plan sheet - the only place with a full expense breakdown"
          action={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Sprout size={17} /></span>}
        />
        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="text-lg font-semibold text-brand-800">{formatCurrency(totalGreenhouseRevenue())}</p>
            <p className="text-[11px] text-brand-700/50">Total Revenue (5 tunnels)</p>
          </div>
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="text-lg font-semibold text-brand-800">{formatCurrency(totalGreenhouseExpenses())}</p>
            <p className="text-[11px] text-brand-700/50">Total Expenses</p>
          </div>
          <div className={`rounded-xl p-3 ${totalGreenhouseRevenue() - totalGreenhouseExpenses() >= 0 ? 'bg-status-healthy/10' : 'bg-status-critical/10'}`}>
            <p className={`text-lg font-semibold ${totalGreenhouseRevenue() - totalGreenhouseExpenses() >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
              {formatCurrency(Math.abs(totalGreenhouseRevenue() - totalGreenhouseExpenses()))}
            </p>
            <p className="text-[11px] text-brand-700/50">{totalGreenhouseRevenue() - totalGreenhouseExpenses() >= 0 ? 'Net Profit' : 'Net Loss'}</p>
          </div>
        </div>
        <div className="space-y-3">
          {greenhouses.map((g) => {
            const profit = g.revenue - g.totalExpenses
            return (
              <div key={g.id} className="rounded-xl border border-brand-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-brand-800">{g.tunnel} - {g.cropName}</p>
                    <p className="text-xs text-brand-700/50">{g.sqft} sqft · Planted {formatDate(g.plantingDate)} · Harvest {formatDate(g.firstHarvestDate)} · {g.harvestedQtyRange}</p>
                  </div>
                  <p className={`flex items-center gap-1 text-sm font-semibold ${profit >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                    {profit >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {formatCurrency(Math.abs(profit))} {profit >= 0 ? 'profit' : 'loss'}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-700/60">
                  <span>Revenue: {formatCurrency(g.revenue)}</span>
                  {g.expenses.map((e) => <span key={e.label}>{e.label}: {formatCurrency(e.amount)}</span>)}
                  <span className="font-medium text-brand-800">Total Expenses: {formatCurrency(g.totalExpenses)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {unmappedCrops.length > 0 && (
        <Card>
          <CardHeader
            title="Other Crops Sold"
            subtitle="Real recorded income from the P&L sheet, not yet assigned to a mapped plot"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {unmappedCrops.map((c) => (
              <div key={c.cropName} className="rounded-xl border border-brand-100 p-3">
                <p className="text-sm font-medium text-brand-800">{c.cropName}</p>
                <p className="text-sm text-brand-700/70">{formatCurrency(c.incomeRs)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  )
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-brand-700/50">{label}</dt>
      <dd className="text-brand-800">{value}</dd>
    </div>
  )
}
