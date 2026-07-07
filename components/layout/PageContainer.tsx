import type { ReactNode } from 'react'
import { Topbar } from './Topbar'

export function PageContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Topbar title={title} />
      <div className="flex-1 space-y-6 p-4 sm:p-6">{children}</div>
    </div>
  )
}
