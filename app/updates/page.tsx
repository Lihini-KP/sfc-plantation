import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { UpdatesClient } from '@/components/updates/UpdatesClient'

export default function UpdatesPage() {
  return (
    <PageContainer title="Daily Plantation Updates">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          No historical log data is connected yet - this starts empty rather than showing invented past entries. New
          entries logged here (with real live weather auto-filled) are real going forward.
        </p>
      </Card>
      <UpdatesClient />
    </PageContainer>
  )
}
