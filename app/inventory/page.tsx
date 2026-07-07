import { PageContainer } from '@/components/layout/PageContainer'
import { InventoryClient } from '@/components/inventory/InventoryClient'

export default function InventoryPage() {
  return (
    <PageContainer title="Inventory Management">
      <InventoryClient />
    </PageContainer>
  )
}
