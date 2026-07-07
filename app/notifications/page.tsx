import { PageContainer } from '@/components/layout/PageContainer'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'

export default function NotificationsPage() {
  return (
    <PageContainer title="Notifications & Alerts">
      <NotificationsClient />
    </PageContainer>
  )
}
