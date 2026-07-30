import { PageContainer } from '@/components/layout/PageContainer'
import { AiInsightsClient } from '@/components/ai/AiInsightsClient'
import { getAreas } from '@/lib/data'

export default async function AiInsightsPage() {
  const areas = await getAreas()
  return (
    <PageContainer title="AI Crop Insights">
      <AiInsightsClient areas={areas} />
    </PageContainer>
  )
}
