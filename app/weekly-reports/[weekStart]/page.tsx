import { PageContainer } from '@/components/layout/PageContainer'
import { WeeklyReportDetailClient } from '@/components/reports/WeeklyReportDetailClient'

export default async function WeeklyReportDetailPage(props: PageProps<'/weekly-reports/[weekStart]'>) {
  const { weekStart } = await props.params

  return (
    <PageContainer title="Weekly Report">
      <WeeklyReportDetailClient weekStart={weekStart} />
    </PageContainer>
  )
}
