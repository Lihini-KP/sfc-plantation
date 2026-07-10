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
  viaSpine: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)
const SESSION_KEY = 'sfc-current-user-id'

// Pull `#srv_token=...` out of the URL hash and strip the fragment before the
// router ever sees it. The launch token rides in the hash; a redirect that
// keeps the hash would leak the (single-use) token into history, and a
// redirect that drops it before we read it would break SSO entirely. So we
// read + strip it synchronously on boot. (Playbook Step 1.)
function consumeLaunchToken(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  const match = hash.match(/[#&]srv_token=([^&]+)/)
  if (!match) return null
  const token = decodeURIComponent(match[1])
  const cleaned = hash.replace(/([#&])srv_token=[^&]+/, '$1').replace(/^#&?/, '')
  const url = window.location.pathname + window.location.search + (cleaned ? `#${cleaned}` : '')
  window.history.replaceState(null, '', url)
  return token
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(roles[0])
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [viaSpine, setViaSpine] = useState(false)

  useEffect(() => {
    let cancelled = false

    function apply(user: AppUser, spine: boolean) {
      if (cancelled) return
      setCurrentUser(user)
      setRole(user.role)
      setViaSpine(spine)
    }

    async function boot() {
      // 1. Fresh SPINE launch (opened from the tile).
      const token = consumeLaunchToken()
      if (token) {
        try {
          const res = await fetch('/api/sso', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          if (res.ok) {
            const { user } = await res.json()
            apply(user, true)
            if (!cancelled) setAuthReady(true)
            return
          }
        } catch {
          // fall through to session / fallback
        }
      }

      // 2. Restore an existing SPINE session (reload, no token in the URL).
      try {
        const res = await fetch('/api/session')
        if (res.ok) {
          const { user } = await res.json()
          if (user) {
            apply(user, true)
            if (!cancelled) setAuthReady(true)
            return
          }
        }
      } catch {
        // fall through to fallback
      }

      // 3. Fallback: shared-password login stored client-side (direct access).
      const savedId = sessionStorage.getItem(SESSION_KEY)
      const savedUser = savedId ? users.find((u) => u.id === savedId) ?? null : null
      if (savedUser) apply(savedUser, false)
      if (!cancelled) setAuthReady(true)
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  function login(userId: string) {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    setCurrentUser(user)
    setRole(user.role)
    setViaSpine(false)
    sessionStorage.setItem(SESSION_KEY, user.id)
  }

  function logout() {
    setCurrentUser(null)
    setViaSpine(false)
    sessionStorage.removeItem(SESSION_KEY)
    // Clear the SPINE session too (no-op if there wasn't one).
    fetch('/api/logout', { method: 'POST' }).catch(() => {})
  }

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser, login, logout, authReady, viaSpine }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
