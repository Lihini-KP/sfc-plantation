import { ExternalLink, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardHeader } from '@/components/ui/Card'

const SHEET_ID = '1XlN8U3YomSvsgnrFVaIMu3enkbm9ARip'
const SHEET_GID = '296284123'
const EDIT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing&gid=${SHEET_GID}`
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing&rm=minimal&widget=true&headers=false&gid=${SHEET_GID}`

export default function CropPlanPage() {
  return (
    <PageContainer title="Crop Plan">
      <Card className="border-brand-200 bg-brand-50">
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-status-attention" />
          <p className="text-xs text-brand-700/70">
            This embeds the estate&apos;s live Annual Crop Plan Google Sheet directly - it always shows the current sheet,
            not a copy. Access follows the sheet&apos;s real Google sharing permissions: if your Google account hasn&apos;t
            been granted access, you&apos;ll see a request-access screen from Google below instead of the data.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Annual Crop Plan"
          subtitle="Live Google Sheet"
          action={
            <a
              href={EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Open in Google Sheets <ExternalLink size={14} />
            </a>
          }
        />
        <div className="w-full overflow-hidden rounded-xl border border-brand-100" style={{ height: '80vh' }}>
          <iframe
            src={EMBED_URL}
            className="h-full w-full border-0"
            title="Annual Crop Plan - Google Sheet"
            loading="lazy"
          />
        </div>
      </Card>
    </PageContainer>
  )
}
