import { PageContainer } from '@/components/layout/PageContainer'
import { HartiMarketClient } from '@/components/harti/HartiMarketClient'
import { getGreenhouses } from '@/lib/data'

export default async function HartiMarketPage() {
  const greenhouses = await getGreenhouses()
  return (
    <PageContainer title="HARTI Market Intelligence">
      <HartiMarketClient greenhouses={greenhouses} />
    </PageContainer>
  )
}
