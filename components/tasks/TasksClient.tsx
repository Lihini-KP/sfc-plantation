'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { tasks as initialTasks } from '@/lib/mock-data/tasks'
import { areas } from '@/lib/mock-data/areas'
import { formatDate } from '@/lib/format'
import type { TaskStatus } from '@/lib/types'

const columns: { key: TaskStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

export function TasksClient() {
  const [tasks, setTasks] = useState(initialTasks)

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, progress: status === 'completed' ? 100 : t.progress } : t)))
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.key)
        return (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-brand-700">{col.label}</h3>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{items.length}</span>
            </div>
            {items.map((task) => {
              const area = areas.find((a) => a.id === task.areaId)
              return (
                <Card key={task.id} className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-brand-800">{task.title}</p>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-xs text-brand-700/50">{task.category}{area ? ` · ${area.name}` : ''}</p>
                  <p className="text-xs text-brand-700/50">Assigned: {task.assignedTo}</p>
                  <p className="text-xs text-brand-700/50">Due: {formatDate(task.dueDate)}</p>
                  <ProgressBar value={task.progress} tone={task.status === 'overdue' ? 'critical' : 'brand'} />
                  {task.notes && <p className="text-xs italic text-brand-700/50">{task.notes}</p>}
                  <select
                    className="w-full rounded-lg border border-brand-100 px-2 py-1.5 text-xs"
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                  >
                    {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </Card>
              )
            })}
            {items.length === 0 && <p className="px-1 text-xs text-brand-700/40">No tasks</p>}
          </div>
        )
      })}
    </div>
  )
}
