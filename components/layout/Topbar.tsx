'use client'

import { Bell, Menu } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { notifications } from '@/lib/mock-data'
import Link from 'next/link'
import { useState } from 'react'
import { MobileNav } from './MobileNav'

export function Topbar({ title }: { title: string }) {
  const { role, userName } = useRole()
  const unread = notifications.filter((n) => !n.read).length
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-brand-700 hover:bg-brand-50 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-brand-800 sm:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative rounded-lg p-2 text-brand-700 hover:bg-brand-50">
          <Bell size={19} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-critical text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 border-l border-brand-100 pl-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {userName.split(' ').map((n) => n[0]).join('')}
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-brand-800 leading-tight">{userName}</p>
            <p className="text-xs text-brand-700/50 leading-tight">{role}</p>
          </div>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
