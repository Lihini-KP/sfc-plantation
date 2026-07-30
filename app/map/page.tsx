import { PageContainer } from '@/components/layout/PageContainer'
import { MapClient } from '@/components/map/MapClient'
import { getAreas, getFacilities, getCrops, getGreenhouses } from '@/lib/data'

export default async function MapPage() {
  const [areas, facilities, crops, greenhouses] = await Promise.all([
    getAreas(), getFacilities(), getCrops(), getGreenhouses(),
  ])

  return (
    <PageContainer title="Interactive Plantation Map">
      <MapClient areas={areas} facilities={facilities} crops={crops} greenhouses={greenhouses} />
    </PageContainer>
  )
}
