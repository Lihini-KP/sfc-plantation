import type { AppUser, UserRole } from '@/lib/types'

// Role categories for the "Preview as Role" switcher - these are just
// labels for previewing the UI, not tied to any specific person.
export const roles: UserRole[] = [
  'Super Admin',
  'Plantation Manager',
  'Farm Supervisor',
  'Field Officer',
  'Livestock Supervisor',
  'Store Keeper',
  'Worker',
  'Finance',
  'Management',
]

// Only real, confirmed names go here. We know these six do field/harvest
// work on the estate; we don't have confirmed job titles for them or names
// for the other role categories above, so nothing is invented to fill them.
export const users: AppUser[] = [
  { id: 'u-1', name: 'R Thambiraja', role: 'Worker', avatarInitials: 'RT' },
  { id: 'u-2', name: 'W A A N Wijesooriya', role: 'Worker', avatarInitials: 'WW' },
  { id: 'u-3', name: 'N M G Dharmasena', role: 'Worker', avatarInitials: 'ND' },
  { id: 'u-4', name: 'W.G. Dissanayaka', role: 'Worker', avatarInitials: 'WD' },
  { id: 'u-5', name: 'Malar Kanthi', role: 'Worker', avatarInitials: 'MK' },
  { id: 'u-6', name: 'Richard', role: 'Worker', avatarInitials: 'R' },
]
