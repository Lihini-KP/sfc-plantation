import { Card, CardHeader } from '@/components/ui/Card'
import { ActionItemsSection, RiskAlertsSection } from './AnalysisView'
import type { HartiAnalysis } from '@/lib/harti-types'

// Overview tab - the same real hartiSummary/actionItems/riskAlerts already
// generated for the other tabs, just gathered into one at-a-glance view.
// No new analysis, no new AI call - purely a different arrangement of
// existing data.
export function ExecutiveSummaryTab({ analysis, subtitle }: { analysis: HartiAnalysis; subtitle: string }) {
  return (
    <div className="harti-tab-content space-y-6">
      <Card>
        <CardHeader title="Executive Summary" subtitle={subtitle} />
        <p className="text-sm text-brand-700/80">{analysis.hartiSummary}</p>
      </Card>
      <ActionItemsSection analysis={analysis} />
      <RiskAlertsSection analysis={analysis} />
    </div>
  )
}
