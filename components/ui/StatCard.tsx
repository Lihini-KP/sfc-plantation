import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'brand',
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: 'brand' | 'earth' | 'warn' | 'critical'
}) {
  const toneStyles = {
    brand: 'bg-brand-50 text-brand-600',
    earth: 'bg-earth-100 text-earth-400',
    warn: 'bg-status-attention/10 text-status-attention',
    critical: 'bg-status-critical/10 text-status-critical',
  }[tone]

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-700/70">{label}</span>
        <span className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', toneStyles)}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-brand-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-700/50">{hint}</p>}
    </div>
  )
}
