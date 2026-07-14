import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

// Wraps a detail section so it can be toggled open/closed from its matching
// dashboard summary card above, and scrolled into view smoothly on open.
//
// Content is only rendered into the DOM when open, rather than always-mounted
// and visually clipped via a CSS height/opacity transition - two different
// CSS-transition-based collapse techniques (grid-template-rows 0fr/1fr, then
// a large max-height cap) both produced inconsistent results in testing that
// didn't repay further debugging. This trades the expand/collapse animation
// for guaranteed correctness; the chevron rotation and hover lift still give
// the interaction some polish.
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
      {open && <div className="mt-4 space-y-6">{children}</div>}
    </div>
  )
}
