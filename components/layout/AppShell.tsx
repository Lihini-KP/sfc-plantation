'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useRole } from '@/lib/role-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, authReady } = useRole()

  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!authReady) return
    if (!currentUser && !isLoginPage) router.replace('/login')
    if (currentUser && isLoginPage) router.replace('/')
  }, [authReady, currentUser, isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (!authReady || !currentUser) {
    return <div className="flex min-h-screen w-full items-center justify-center text-sm text-brand-700/40">Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {children}
    </div>
  )
}
