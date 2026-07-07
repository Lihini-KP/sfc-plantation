import {
  LandPlot,
  Leaf,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  Wheat,
  CalendarClock,
  Gauge,
  ListChecks,
  Bird,
  Egg,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/Badge'
import { FinanceTrendChart } from '@/components/dashboard/FinanceTrendChart'
import { LiveWeatherCard } from '@/components/dashboard/LiveWeatherCard'
import { getDashboardStats } from '@/lib/dashboard-stats'
import { notifications, aiAnalyses, areas } from '@/lib/mock-data'
import { formatCurrency, timeAgo } from '@/lib/format'

export default function DashboardPage() {
  const s = getDashboardStats()
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 4)
  const topRecommendations = aiAnalyses
    .filter((a) => a.severity === 'high' || a.severity === 'critical' || a.severity === 'medium')
    .sort((a, b) => b.severity.localeCompare(a.severity))
    .slice(0, 3)

  return (
    <PageContainer title="Dashboard">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Plantation Area" value={`${s.totalAreaAcres.toFixed(1)} ac`} icon={LandPlot} />
        <StatCard label="Cultivated Area" value={`${s.totalCultivatedAreaAcres.toFixed(1)} ac`} icon={Leaf} tone="earth" />
        <StatCard label="Crops" value={`${s.numberOfCrops}`} icon={Sprout} />
        <StatCard label="Total Plants" value={s.totalPlants.toLocaleString()} icon={Sprout} />
        <StatCard label="Healthy Plants" value={s.healthyPlants.toLocaleString()} icon={ShieldCheck} />
        <StatCard label="Needs Attention" value={s.attentionPlants.toLocaleString()} icon={AlertTriangle} tone="warn" />
        <StatCard label="Harvest Ready Areas" value={`${s.harvestReadyAreas}`} icon={Wheat} />
        <StatCard label="Upcoming Harvests" value={`${s.upcomingHarvests}`} icon={CalendarClock} tone="earth" />
        <StatCard label="Weekly Production Est." value={`${s.weeklyProductionEstimateKg} kg`} icon={Gauge} />
        <StatCard label="Active Tasks" value={`${s.activeTasks}`} icon={ListChecks} tone="earth" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Income vs Expenses" subtitle="From the estate's P&L Cultivation records" />
          <FinanceTrendChart />
        </Card>

        <LiveWeatherCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Chicken Farm Summary" action={<Bird size={18} className="text-brand-600" />} />
          <div className="rounded-xl bg-status-attention/10 p-3 text-center">
            <p className="text-sm font-semibold text-status-attention">Not yet operational</p>
            <p className="mt-1 text-xs text-brand-700/50">Planned to start this month (July 2026) - exact day not yet confirmed</p>
          </div>
          <Link href="/chicken-farm" className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View chicken farm <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <CardHeader title="Egg Production Summary" action={<Egg size={18} className="text-brand-600" />} />
          <div className="rounded-xl bg-status-attention/10 p-3 text-center">
            <p className="text-sm font-semibold text-status-attention">No production yet</p>
            <p className="mt-1 text-xs text-brand-700/50">Egg production begins once the chicken farm is operational</p>
          </div>
          <Link href="/chicken-farm" className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View chicken farm <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <CardHeader title={`Financials - ${s.latestMonth}`} subtitle="From the P&L Cultivation sheet" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-700/60">Income</span>
            <span className="font-medium text-brand-800">{formatCurrency(s.latestMonthIncome)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-brand-700/60">Expenses</span>
            <span className="font-medium text-brand-800">{formatCurrency(s.latestMonthExpenses)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-brand-700/60">Profit / Loss</span>
            <span className={`font-semibold ${s.latestMonthProfitLoss >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
              {formatCurrency(s.latestMonthProfitLoss)}
            </span>
          </div>
          <Link href="/reports" className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View reports <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Daily Notifications" subtitle={`${unreadNotifications.length} unread`} />
          <div className="space-y-3">
            {unreadNotifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-100 p-3">
                <div>
                  <p className="text-sm font-medium text-brand-800">{n.title}</p>
                  <p className="mt-0.5 text-xs text-brand-700/60">{n.message}</p>
                  <p className="mt-1 text-[11px] text-brand-700/40">{timeAgo(n.createdAt)}</p>
                </div>
                <SeverityBadge severity={n.severity} />
              </div>
            ))}
          </div>
          <Link href="/notifications" className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View all notifications <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <CardHeader title="AI Recommendations" action={<Sparkles size={18} className="text-brand-600" />} />
          <div className="space-y-3">
            {topRecommendations.map((a) => (
              <div key={a.areaId} className="rounded-xl border border-brand-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-brand-800">{areas.find((ar) => ar.id === a.areaId)?.name || a.areaId}</p>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="mt-1 text-xs text-brand-700/60">{a.recommendedActions[0]}</p>
              </div>
            ))}
          </div>
          <Link href="/ai-insights" className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            Open AI Insights <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </PageContainer>
  )
}
