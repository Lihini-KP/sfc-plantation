import { PageContainer } from '@/components/layout/PageContainer'
import { WeeklyReportsListClient } from '@/components/reports/WeeklyReportsListClient'

export default function WeeklyReportsPage() {
  return (
    <PageContainer title="Weekly Reports">
      <WeeklyReportsListClient />
    </PageContainer>
  )
}
