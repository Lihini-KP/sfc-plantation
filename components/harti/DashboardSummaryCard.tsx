import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export interface SummaryStat {
  label: string
  value: string
}

// Static dashboard-style summary tile - icon + title + a few key stats for
// the current week's saved report. No longer clickable/expandable - full
// detail for any week lives in the Weekly Reports panel's "View Report".
export function DashboardSummaryCard({
  icon: Icon,
  title,
  stats,
  tone = 'brand',
}: {
  icon: LucideIcon
  title: string
  stats: SummaryStat[]
  tone?: 'brand' | 'earth' | 'warn' | 'critical'
}) {
  const toneStyles = {
    brand: 'bg-brand-50 text-brand-600',
    earth: 'bg-earth-100 text-earth-400',
    warn: 'bg-status-attention/10 text-status-attention',
    critical: 'bg-status-critical/10 text-status-critical',
  }[tone]

  return (
    <div className="w-full rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-800">{title}</span>
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneStyles)}>
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-3.5 space-y-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-brand-700/60">{s.label}</span>
            <span className="font-semibold text-brand-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
