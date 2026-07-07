'use client'

import { Sprout, AlertTriangle } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { users } from '@/lib/mock-data/users'
import type { UserRole } from '@/lib/types'

const roleOrder: UserRole[] = ['Admin', 'Director', 'Assistant Factory Manager', 'Field Officer', 'Worker']

export default function LoginPage() {
  const { login } = useRole()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <Sprout size={26} />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-brand-800">Silk Food Ceylon</h1>
        <p className="text-sm text-brand-700/60">Plantation Platform</p>
      </div>

      <div className="w-full max-w-xl rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-brand-800">Sign in</h2>
        <p className="mt-1 text-sm text-brand-700/60">Select your account to continue.</p>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-status-attention/10 p-3">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-attention" />
          <p className="text-xs text-brand-700/70">
            This is a demo account-select login for the prototype - there&apos;s no password check yet. Real sign-in
            (email/password via Supabase Auth) will replace this once the Supabase project is connected.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {roleOrder.map((role) => {
            const roleUsers = users.filter((u) => u.role === role)
            if (roleUsers.length === 0) return null
            return (
              <div key={role}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700/40">{role}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {roleUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => login(u.id)}
                      className="flex items-center gap-3 rounded-xl border border-brand-100 px-4 py-3 text-left hover:border-brand-600 hover:bg-brand-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {u.avatarInitials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-brand-800">{u.name}</p>
                        <p className="text-xs text-brand-700/50">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
