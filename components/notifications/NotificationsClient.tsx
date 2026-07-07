'use client'

import { useState } from 'react'
import { Check, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/Badge'
import { notifications as initial } from '@/lib/mock-data/notifications'
import { formatDateTime } from '@/lib/format'

export function NotificationsClient() {
  const [items, setItems] = useState(initial)

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader title="Delivery Channels" subtitle="Configured alert channels for this platform" />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-brand-50 p-3">
            <Mail size={16} className="mx-auto text-brand-600" />
            <p className="mt-1 text-xs font-medium text-brand-700">Email — Active</p>
          </div>
          <div className="rounded-xl bg-brand-50 p-3">
            <MessageSquare size={16} className="mx-auto text-brand-600" />
            <p className="mt-1 text-xs font-medium text-brand-700">SMS — Planned</p>
          </div>
          <div className="rounded-xl bg-brand-50 p-3">
            <Smartphone size={16} className="mx-auto text-brand-600" />
            <p className="mt-1 text-xs font-medium text-brand-700">Push — Planned</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <CardHeader title="All Notifications" subtitle={`${unreadCount} unread`} />
          <button onClick={markAllRead} className="mb-4 flex items-center gap-1.5 rounded-xl border border-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50">
            <Check size={13} /> Mark all read
          </button>
        </div>
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${n.read ? 'border-brand-50 bg-white' : 'border-brand-100 bg-brand-50/50'}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                  <p className="text-sm font-medium text-brand-800">{n.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-brand-700/60">{n.message}</p>
                <p className="mt-1 text-[11px] text-brand-700/40">{n.category} · {formatDateTime(n.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <SeverityBadge severity={n.severity} />
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-[11px] font-medium text-brand-600 hover:underline">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
