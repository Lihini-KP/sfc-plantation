'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Sprout } from 'lucide-react'
import { navItems } from './nav-items'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-100 bg-white lg:flex">
      <div className="flex items-center gap-2 border-b border-brand-100 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Sprout size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-800 leading-tight">Silk Food Ceylon</p>
          <p className="text-xs text-brand-700/50 leading-tight">Plantation Platform</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700/70 hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-brand-100 px-5 py-4 text-xs text-brand-700/40">
        Prototype build - sample data only
      </div>
    </aside>
  )
}
