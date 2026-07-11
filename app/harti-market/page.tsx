import { PageContainer } from '@/components/layout/PageContainer'
import { HartiMarketClient } from '@/components/harti/HartiMarketClient'

export default function HartiMarketPage() {
  return (
    <PageContainer title="HARTI Market Intelligence">
      <HartiMarketClient />
    </PageContainer>
  )
}
