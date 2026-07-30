import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { TunnelDetailClient } from '@/components/tunnels/TunnelDetailClient'
import { getGreenhouses, getCrops } from '@/lib/data'

export default async function TunnelDetailPage(props: PageProps<'/tunnels/[id]'>) {
  const { id } = await props.params
  const [greenhouses, crops] = await Promise.all([getGreenhouses(), getCrops()])
  const tunnel = greenhouses.find((g) => g.id === id)
  if (!tunnel) notFound()

  return (
    <PageContainer title={`Tunnel ${tunnel.tunnel}`}>
      <TunnelDetailClient tunnel={tunnel} crops={crops} />
    </PageContainer>
  )
}
