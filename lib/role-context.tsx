'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserRole } from '@/lib/types'
import { currentUser } from '@/lib/mock-data'

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  userName: string
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(currentUser.role)
  return (
    <RoleContext.Provider value={{ role, setRole, userName: currentUser.name }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
