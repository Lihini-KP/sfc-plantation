import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { InventoryClient } from '@/components/inventory/InventoryClient'

export default function InventoryPage() {
  return (
    <PageContainer title="Inventory Management">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          No real inventory tracking source is connected yet - this starts empty rather than showing invented stock levels.
        </p>
      </Card>
      <InventoryClient />
    </PageContainer>
  )
}
