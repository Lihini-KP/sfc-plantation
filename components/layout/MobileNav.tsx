'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { X, Sprout } from 'lucide-react'
import { navItems } from './nav-items'

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Sprout size={18} />
            </span>
            <p className="text-sm font-semibold text-brand-800">Silk Food Ceylon</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  active ? 'bg-brand-600 text-white' : 'text-brand-700/70 hover:bg-brand-50'
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
