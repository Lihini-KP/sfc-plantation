import type { PlantationTask } from '@/lib/types'

// Real tasks only, sourced from actual ATLAS/Task Commander email history for
// Arushika Devindi (field.plant.based@gmail.com) - her only standing
// responsibilities found in the mailbox. As of the 2026-07-08 leadership
// overdue digest she has zero overdue tasks, so nothing here is overdue.
// Due dates below are projected from her real weekly/monthly submission
// pattern (e.g. weekly report consistently submitted the day after each
// Thu/Fri period end) - not confirmed exact ATLAS deadlines, since we don't
// have live API access to ATLAS itself yet. Resolved one-off tasks
// (Completion of Tunnel Alpha, King Coconut Planting, Tunnel Alpha/Bravo
// cleaning) are excluded since they no longer appear as active/overdue.
export const tasks: PlantationTask[] = [
  {
    id: 'task-1',
    title: 'Weekly Income and Expenses Report Submission',
    category: 'Reporting',
    assignedTo: 'Arushika Devindi',
    dueDate: '2026-07-11',
    priority: 'medium',
    status: 'in_progress',
    progress: 50,
    notes: 'Recurring weekly. Last submitted 2026-07-04 for the 2026/06/26-07/03 period.',
  },
  {
    id: 'task-2',
    title: 'Monthly P&L Statement Submission',
    category: 'Reporting',
    assignedTo: 'Arushika Devindi',
    dueDate: '2026-07-15',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    notes: 'Recurring monthly. Last submitted 2026-06-15.',
  },
  {
    id: 'task-3',
    title: 'Submit Monthly Cash Requirement Plan - Plantation',
    category: 'Reporting',
    assignedTo: 'Arushika Devindi',
    dueDate: '2026-07-30',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    notes: 'Recurring monthly. Last submitted 2026-06-30.',
  },
  {
    id: 'task-4',
    title: 'Monthly Harvest Return Report Submission',
    category: 'Reporting',
    assignedTo: 'Arushika Devindi',
    dueDate: '2026-08-01',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    notes: 'Recurring monthly. Last submitted 2026-07-01.',
  },
  {
    id: 'task-5',
    title: 'Submit Cash Inflow Forecast for the Month (Weekly Breakdown) - Plantation',
    category: 'Reporting',
    assignedTo: 'Arushika Devindi',
    dueDate: '2026-08-01',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    notes: 'Recurring monthly. Last submitted 2026-07-01.',
  },
]
