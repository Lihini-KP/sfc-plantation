'use client'

import { useState } from 'react'
import { Sprout, Lock, User as UserIcon } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { users } from '@/lib/mock-data/users'
import { SHARED_ACCESS_PASSWORD } from '@/lib/auth-config'

const loginUsers = users.filter((u) => u.role !== 'Worker')

export default function LoginPage() {
  const { login } = useRole()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      setError('Select your name.')
      return
    }
    if (password !== SHARED_ACCESS_PASSWORD) {
      setError('Incorrect password.')
      return
    }
    setError('')
    login(userId)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0efe9] p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Visual panel - placeholder graphic until a real estate photo is provided */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #173b2e 0%, #0c1b15 60%, #12291f 100%)' }} />
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
            <g stroke="#4fa858" strokeWidth="1.5" fill="none" opacity="0.6">
              <path d="M200,460 L200,320 M200,320 L140,260 M200,320 L260,250 M140,260 L90,210 M140,260 L150,190 M260,250 L320,290 M260,250 L290,180" />
            </g>
            {[
              [200, 460], [200, 320], [140, 260], [260, 250],
              [90, 210], [150, 190], [320, 290], [290, 180],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i === 0 ? 7 : 5} fill="#7cc182" />
            ))}
          </svg>

          <div className="relative z-10">
            <p className="text-3xl font-bold tracking-tight">SFC PLANTATION</p>
            <p className="mt-1 text-xs font-semibold tracking-widest text-white/50">SRV | SFC | ANCIENT NUTRA</p>
          </div>

          <div className="relative z-10">
            <p className="text-xl font-semibold leading-snug">
              <span className="text-white">Estate </span>
              <span className="text-brand-300">Operations</span>
              <span className="text-white">, </span>
              <span className="text-brand-300">Harvests</span>
              <span className="text-white"> &amp; </span>
              <span className="text-brand-300">Finance</span>
              <span className="text-white">, one platform.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/50">
              Real field photography from the estate is coming soon - this panel is a placeholder until then.
            </p>
          </div>
        </div>

        {/* Login form panel */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Sprout size={20} />
            </span>
            <p className="text-sm font-semibold text-brand-800">SFC Plantation</p>
          </div>

          <h1 className="text-2xl font-bold text-brand-900">Welcome back</h1>
          <p className="mt-1 text-sm text-brand-700/60">Sign in to the SFC Plantation Platform.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-700/40" />
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-brand-50 py-3 pl-10 pr-3 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              >
                <option value="">Select your name</option>
                {loginUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} - {u.role}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-700/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl bg-brand-50 py-3 pl-10 pr-3 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
            </div>

            {error && <p className="text-xs font-medium text-status-critical">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-brand-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Sign In
            </button>
          </form>

          <button
            type="button"
            onClick={() => setNotice('Contact the Admin to reset your password - self-service reset isn\'t wired up yet.')}
            className="mt-4 self-start text-sm font-medium text-brand-700 hover:underline"
          >
            Forgot password?
          </button>
          {notice && <p className="mt-1 text-xs text-brand-700/50">{notice}</p>}

          <p className="mt-6 text-xs text-brand-700/40">
            Use your name and the access password shared with you. Trouble signing in? Reach out to the Admin.
          </p>
        </div>
      </div>
    </div>
  )
}
