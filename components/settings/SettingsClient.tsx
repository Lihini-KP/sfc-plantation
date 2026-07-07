'use client'

import { Check, UserCog } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { useRole } from '@/lib/role-context'
import { roles, users } from '@/lib/mock-data/users'

export function SettingsClient() {
  const { role, setRole } = useRole()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Preview as Role"
          subtitle="Switch roles to preview how the platform looks for each responsibility. No real authentication in this prototype."
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-brand-100 text-brand-700/70 hover:bg-brand-50'}`}
            >
              {r}
              {role === r && <Check size={15} className="text-brand-600" />}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Known Staff"
          subtitle="Real names only - confirmed field/harvest workers. Job titles for other roles (Plantation Manager, Finance, etc.) aren't confirmed yet, so no names are shown for those."
          action={<UserCog size={18} className="text-brand-600" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs text-brand-700/50">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-brand-50 last:border-0">
                  <td className="flex items-center gap-2 py-2.5 pr-4 text-brand-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">{u.avatarInitials}</span>
                    {u.name}
                  </td>
                  <td className="py-2.5 text-brand-700/70">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
