import type { AppUser, UserRole } from '@/lib/types'

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

export const users: AppUser[] = [
  { id: 'u-1', name: 'Hasitha Ranasinghe', role: 'Super Admin', avatarInitials: 'HR' },
  { id: 'u-2', name: 'Dilani Gunawardena', role: 'Plantation Manager', avatarInitials: 'DG' },
  { id: 'u-3', name: 'R Thambiraja', role: 'Farm Supervisor', avatarInitials: 'RT' },
  { id: 'u-4', name: 'W A A N Wijesooriya', role: 'Field Officer', avatarInitials: 'WW' },
  { id: 'u-5', name: 'Anoma Jayawardena', role: 'Livestock Supervisor', avatarInitials: 'AJ' },
  { id: 'u-6', name: 'Ranjith Kumara', role: 'Store Keeper', avatarInitials: 'RK' },
  { id: 'u-7', name: 'Malar Kanthi', role: 'Worker', avatarInitials: 'MK' },
  { id: 'u-8', name: 'Priyantha Costa', role: 'Finance', avatarInitials: 'PC' },
  { id: 'u-9', name: 'Malini Abeysekera', role: 'Management', avatarInitials: 'MA' },
]

export const currentUser = users[0]
