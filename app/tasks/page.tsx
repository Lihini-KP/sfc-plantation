import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { TasksClient } from '@/components/tasks/TasksClient'

export default function TasksPage() {
  return (
    <PageContainer title="Task Management">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Real tasks only, sourced from ATLAS/Task Commander email history for Arushika Devindi - her actual standing
          reporting responsibilities. She has zero overdue tasks as of the latest company-wide digest (2026-07-08). Due
          dates are projected from her real submission cadence, not pulled live from ATLAS yet (that requires the SPINE
          API connection - see the Crop Plan / integration work in progress).
        </p>
      </Card>
      <TasksClient />
    </PageContainer>
  )
}
