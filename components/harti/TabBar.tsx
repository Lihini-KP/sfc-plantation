'use client'

import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export interface TabDef<K extends string> {
  key: K
  label: string
  icon: LucideIcon
}

// Horizontal, sticky top-navigation tab bar - replaces scrolling to a
// section further down the page. Only the active tab's content panel is
// ever rendered below; switching tabs never scrolls the page.
export function TabBar<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef<K>[]
  active: K
  onChange: (key: K) => void
}) {
  return (
    <div className="sticky top-16 z-10 -mx-4 overflow-x-auto border-b border-brand-100 bg-white/95 backdrop-blur sm:-mx-6 sm:top-[72px]">
      <div className="flex min-w-max gap-1 px-4 sm:gap-2 sm:px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={clsx(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-brand-700/50 hover:border-brand-200 hover:text-brand-700',
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
