import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { TunnelDetailClient } from '@/components/tunnels/TunnelDetailClient'
import { greenhouses } from '@/lib/mock-data/greenhouses'

export default async function TunnelDetailPage(props: PageProps<'/tunnels/[id]'>) {
  const { id } = await props.params
  const tunnel = greenhouses.find((g) => g.id === id)
  if (!tunnel) notFound()

  return (
    <PageContainer title={`Tunnel ${tunnel.tunnel}`}>
      <TunnelDetailClient tunnel={tunnel} />
    </PageContainer>
  )
}
