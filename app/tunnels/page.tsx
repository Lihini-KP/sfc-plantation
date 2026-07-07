import Link from 'next/link'
import { Tent, ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { greenhouses } from '@/lib/mock-data/greenhouses'

export default function TunnelsPage() {
  return (
    <PageContainer title="Tunnels">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Real tunnel sizes and current crops, transcribed from the Annual Crop Plan sheet. Click a tunnel to open its
          detail page - daily updates, planting records, harvests, maintenance and images will attach there as they're added.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {greenhouses.map((g) => (
          <Link key={g.id} href={`/tunnels/${g.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Tent size={20} />
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-brand-600">
                  Open <ArrowRight size={13} />
                </span>
              </div>
              <p className="mt-4 text-lg font-semibold text-brand-800">Tunnel {g.tunnel}</p>
              <p className="text-sm text-brand-700/60">{g.sqft.toLocaleString()} sqft</p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-sm">
                <span className="text-brand-700/60">Current crop</span>
                <span className="font-medium text-brand-800">{g.cropName}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
