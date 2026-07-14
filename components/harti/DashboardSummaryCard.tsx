import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export interface SummaryStat {
  label: string
  value: string
}

// Clickable dashboard-style summary card - icon + title + a few key stats,
// rounded with a hover lift, used at the top of HARTI Market Intelligence to
// jump to (and toggle open) the matching detail section below.
export function DashboardSummaryCard({
  icon: Icon,
  title,
  stats,
  active,
  onClick,
  tone = 'brand',
}: {
  icon: LucideIcon
  title: string
  stats: SummaryStat[]
  active: boolean
  onClick: () => void
  tone?: 'brand' | 'earth' | 'warn' | 'critical'
}) {
  const toneStyles = {
    brand: 'bg-brand-50 text-brand-600',
    earth: 'bg-earth-100 text-earth-400',
    warn: 'bg-status-attention/10 text-status-attention',
    critical: 'bg-status-critical/10 text-status-critical',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        active ? 'border-brand-300 ring-1 ring-brand-200' : 'border-brand-100',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-800">{title}</span>
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors', toneStyles)}>
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-brand-700/60">{s.label}</span>
            <span className="font-semibold text-brand-800">{s.value}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
