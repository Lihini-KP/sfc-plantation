import { PageContainer } from '@/components/layout/PageContainer'
import { UpdatesClient } from '@/components/updates/UpdatesClient'

export default function UpdatesPage() {
  return (
    <PageContainer title="Daily Plantation Updates">
      <UpdatesClient />
    </PageContainer>
  )
}
