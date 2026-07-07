'use client'

import { useState } from 'react'
import { Sprout, AlertTriangle, Lock, User as UserIcon, Leaf } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { users } from '@/lib/mock-data/users'

const loginUsers = users.filter((u) => u.role !== 'Worker')

export default function LoginPage() {
  const { login } = useRole()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      setError('Select your name.')
      return
    }
    if (!password) {
      setError('Enter a password.')
      return
    }
    setError('')
    login(userId)
  }

  return (
    <div className="flex min-h-screen">
      {/* Visual panel - placeholder gradient until a real estate photo is provided */}
      <div className="relative hidden w-1/2 overflow-hidden bg-brand-800 lg:flex lg:flex-col lg:justify-end">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #173b2e 0%, #0c1b15 55%, #12291f 100%)' }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <path d="M0,420 Q100,380 200,410 T400,390 V600 H0 Z" fill="#2f8a3d" />
          <path d="M0,480 Q120,440 240,470 T400,450 V600 H0 Z" fill="#4fa858" />
          <circle cx="330" cy="90" r="55" fill="#7cc182" opacity="0.5" />
        </svg>
        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Leaf size={22} />
            </span>
            <div>
              <p className="text-lg font-semibold">Silk Food Ceylon</p>
              <p className="text-sm text-white/60">Plantation Platform</p>
            </div>
          </div>
          <p className="mt-8 max-w-sm text-2xl font-medium leading-snug">
            Precision agriculture and estate management, from field to factory.
          </p>
          <p className="mt-4 max-w-sm text-sm text-white/50">
            Real estate photography coming soon - this panel is a placeholder pending a photo from the plantation.
          </p>
        </div>
      </div>

      {/* Login form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-4 py-10 lg:w-1/2">
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Sprout size={26} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-brand-800">Silk Food Ceylon</h1>
          <p className="text-sm text-brand-700/60">Plantation Platform</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-brand-800">Sign in</h2>
          <p className="mt-1 text-sm text-brand-700/60">Access your plantation management dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-brand-700/70">Name</span>
              <div className="relative">
                <UserIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-700/40" />
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-brand-100 bg-white py-2.5 pl-9 pr-3 text-brand-800 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                >
                  <option value="">Select your name</option>
                  {loginUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} - {u.role}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-brand-700/70">Password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-700/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-brand-100 bg-white py-2.5 pl-9 pr-3 text-brand-800 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
            </label>

            {error && <p className="text-xs font-medium text-status-critical">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Sign In
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-status-attention/10 p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-status-attention" />
            <p className="text-xs text-brand-700/70">
              Prototype stage: password isn&apos;t verified against anything real yet - any password signs you in as the
              selected name. Real authentication will replace this once Supabase Auth is connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
