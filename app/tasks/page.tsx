import { PageContainer } from '@/components/layout/PageContainer'
import { TasksClient } from '@/components/tasks/TasksClient'

export default function TasksPage() {
  return (
    <PageContainer title="Task Management">
      <TasksClient />
    </PageContainer>
  )
}
