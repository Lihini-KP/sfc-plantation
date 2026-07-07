import { PageContainer } from '@/components/layout/PageContainer'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default function SettingsPage() {
  return (
    <PageContainer title="Roles & Settings">
      <SettingsClient />
    </PageContainer>
  )
}
