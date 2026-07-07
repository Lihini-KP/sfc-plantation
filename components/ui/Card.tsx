import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl border border-brand-100 bg-white p-5 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-brand-700">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-brand-700/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
