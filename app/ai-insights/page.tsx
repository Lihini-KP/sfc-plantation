import { PageContainer } from '@/components/layout/PageContainer'
import { AiInsightsClient } from '@/components/ai/AiInsightsClient'

export default function AiInsightsPage() {
  return (
    <PageContainer title="AI Crop Insights">
      <AiInsightsClient />
    </PageContainer>
  )
}
