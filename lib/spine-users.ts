// Maps a verified SPINE identity (email + admin flag) onto an app user + role.
//
// SPINE is the source of truth for *who* may enter (the grant + the launch
// token). This map only decides which in-app role that person sees. Anyone
// SPINE lets in but who isn't mapped here still gets in as a Field Officer
// (the day-to-day operational role) - least privilege that can still use the
// tool. The launch token's `admin` flag always upgrades to Admin.
import type { AppUser, UserRole } from '@/lib/types'

interface SpinePerson {
  name: string
  role: UserRole
  initials: string
}

// Keyed by canonical SPINE email (lowercase) - sourced from sage.people.
const SPINE_PEOPLE: Record<string, SpinePerson> = {
  'hra@esilkroute.com.lk': { name: 'Lihini Kavindi', role: 'Admin', initials: 'LK' },
  'sahan@esilkroute.com.lk': { name: 'Sahan Bakmiwewa', role: 'Director', initials: 'SB' },
  'procurement@plantbased.lk': { name: 'Dhanusha Herath', role: 'Assistant Factory Manager', initials: 'DH' },
  'field.plant.based@gmail.com': { name: 'Arushika Devindi', role: 'Field Officer', initials: 'AD' },
}

const DEFAULT_ROLE: UserRole = 'Field Officer'

function deriveInitials(name: string): string {
  const derived = name
    .split(/[.\s_-]+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
  return derived || 'U'
}

export function resolveSpineUser(email: string, admin: boolean): AppUser {
  const key = email.toLowerCase()
  const person = SPINE_PEOPLE[key]
  const name = person?.name ?? email.split('@')[0]
  const role: UserRole = admin ? 'Admin' : (person?.role ?? DEFAULT_ROLE)
  const initials = person?.initials ?? deriveInitials(name)
  return { id: `spine:${key}`, name, role, avatarInitials: initials }
}
