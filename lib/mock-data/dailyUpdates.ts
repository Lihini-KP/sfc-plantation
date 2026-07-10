import type { DailyUpdate } from '@/lib/types'

// No real historical log data connected yet - previous entries here were
// entirely invented. Left empty. Entries submitted via the "Log New Update"
// form are saved to localStorage (see UpdatesClient.tsx) - not to this file -
// so they persist per-browser only until a real Supabase-backed write exists.
export const dailyUpdates: DailyUpdate[] = []
