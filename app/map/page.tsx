import { PageContainer } from '@/components/layout/PageContainer'
import { MapClient } from '@/components/map/MapClient'

export default function MapPage() {
  return (
    <PageContainer title="Interactive Plantation Map">
      <MapClient />
    </PageContainer>
  )
}
