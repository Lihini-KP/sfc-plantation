import clsx from 'clsx'
import type { HealthStatus, Severity, TaskStatus, TaskPriority } from '@/lib/types'

const healthStyles: Record<HealthStatus, string> = {
  healthy: 'bg-status-healthy/10 text-status-healthy border-status-healthy/30',
  attention: 'bg-status-attention/10 text-status-attention border-status-attention/30',
  moderate: 'bg-status-moderate/10 text-status-moderate border-status-moderate/30',
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/30',
}

const severityStyles: Record<Severity, string> = {
  low: 'bg-status-healthy/10 text-status-healthy border-status-healthy/30',
  medium: 'bg-status-attention/10 text-status-attention border-status-attention/30',
  high: 'bg-status-moderate/10 text-status-moderate border-status-moderate/30',
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/30',
}

const taskStatusStyles: Record<TaskStatus, string> = {
  pending: 'bg-earth-100 text-earth-400 border-earth-200',
  in_progress: 'bg-brand-100 text-brand-600 border-brand-200',
  completed: 'bg-status-healthy/10 text-status-healthy border-status-healthy/30',
  overdue: 'bg-status-critical/10 text-status-critical border-status-critical/30',
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-earth-100 text-earth-400 border-earth-200',
  medium: 'bg-brand-100 text-brand-600 border-brand-200',
  high: 'bg-status-moderate/10 text-status-moderate border-status-moderate/30',
  urgent: 'bg-status-critical/10 text-status-critical border-status-critical/30',
}

function Base({ label, className }: { label: string; className: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize', className)}>
      {label.replace('_', ' ')}
    </span>
  )
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  return <Base label={status} className={healthStyles[status]} />
}
export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Base label={severity} className={severityStyles[severity]} />
}
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Base label={status} className={taskStatusStyles[status]} />
}
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Base label={priority} className={priorityStyles[priority]} />
}
