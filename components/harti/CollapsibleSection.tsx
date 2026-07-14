import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

// Wraps a detail section so it can be toggled open/closed from its matching
// dashboard summary card above, and scrolled into view smoothly on open.
export function CollapsibleSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-2xl border border-brand-100 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md"
      >
        <span className="text-sm font-semibold text-brand-800">{title}</span>
        <ChevronDown size={16} className={`text-brand-700/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="space-y-6 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
