import { PageContainer } from '@/components/layout/PageContainer'
import { ChickenFarmClient } from '@/components/chicken/ChickenFarmClient'

export default function ChickenFarmPage() {
  return (
    <PageContainer title="Chicken Farm Management">
      <ChickenFarmClient />
    </PageContainer>
  )
}
