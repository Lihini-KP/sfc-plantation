'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserRole, AppUser } from '@/lib/types'
import { roles, users } from '@/lib/mock-data'

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  currentUser: AppUser | null
  login: (userId: string) => void
  logout: () => void
  authReady: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)
const SESSION_KEY = 'sfc-current-user-id'

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(roles[0])
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const savedId = sessionStorage.getItem(SESSION_KEY)
    const savedUser = savedId ? users.find((u) => u.id === savedId) ?? null : null
    if (savedUser) {
      setCurrentUser(savedUser)
      setRole(savedUser.role)
    }
    setAuthReady(true)
  }, [])

  function login(userId: string) {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    setCurrentUser(user)
    setRole(user.role)
    sessionStorage.setItem(SESSION_KEY, user.id)
  }

  function logout() {
    setCurrentUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser, login, logout, authReady }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
