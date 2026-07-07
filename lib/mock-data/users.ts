import type { AppUser, UserRole } from '@/lib/types'

// Role categories - reflects the estate's actual organizational structure
// as confirmed. Used both for login and for the "Preview as Role" switcher.
export const roles: UserRole[] = [
  'Admin',
  'Director',
  'Assistant Factory Manager',
  'Field Officer',
  'Worker',
]

// Real, confirmed people only.
export const users: AppUser[] = [
  { id: 'u-1', name: 'Lihini Kavindi', role: 'Admin', avatarInitials: 'LK' },
  { id: 'u-2', name: 'Sahan Bakmiwewa', role: 'Director', avatarInitials: 'SB' },
  { id: 'u-3', name: 'Dhanusha Herath', role: 'Assistant Factory Manager', avatarInitials: 'DH' },
  { id: 'u-4', name: 'Arushika Devindi', role: 'Field Officer', avatarInitials: 'AD' },
  { id: 'u-5', name: 'R Thambiraja', role: 'Worker', avatarInitials: 'RT' },
  { id: 'u-6', name: 'W A A N Wijesooriya', role: 'Worker', avatarInitials: 'WW' },
  { id: 'u-7', name: 'N M G Dharmasena', role: 'Worker', avatarInitials: 'ND' },
  { id: 'u-8', name: 'W.G. Dissanayaka', role: 'Worker', avatarInitials: 'WD' },
  { id: 'u-9', name: 'Malar Kanthi', role: 'Worker', avatarInitials: 'MK' },
  { id: 'u-10', name: 'Richard', role: 'Worker', avatarInitials: 'R' },
]
