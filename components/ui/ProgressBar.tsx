import clsx from 'clsx'

export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'critical' | 'warn' }) {
  const barTone = {
    brand: 'bg-brand-500',
    critical: 'bg-status-critical',
    warn: 'bg-status-attention',
  }[tone]

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-50">
      <div className={clsx('h-full rounded-full transition-all', barTone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function ScoreRing({ value }: { value: number }) {
  const tone = value >= 85 ? '#15803d' : value >= 65 ? '#d4a72c' : value >= 45 ? '#e07b2c' : '#dc2626'
  const circumference = 2 * Math.PI * 26
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#eef7ee" strokeWidth="7" />
        <circle
          cx="32" cy="32" r="26" fill="none" stroke={tone} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-semibold" style={{ color: tone }}>{value}%</span>
    </div>
  )
}
