import type { AppNotification } from '@/lib/types'

// No real notification source is wired up yet. The previous contents here
// were entirely invented (a chicken batch that doesn't exist since the farm
// isn't operational, a task that isn't in the real task list, AI-detected
// disease/pest findings with no real vision pipeline, and inventory levels
// nobody has actually recorded) - left empty rather than fabricated.
export const notifications: AppNotification[] = []
