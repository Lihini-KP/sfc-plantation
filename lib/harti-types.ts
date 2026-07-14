// Shared shape of the HARTI weekly market + tunnel analysis - used by the
// live dashboard (components/harti/HartiMarketClient.tsx) and the saved
// Weekly Reports archive (components/reports/*), which both render the same
// data via components/harti/AnalysisView.tsx.

export interface CropMarketTrend {
  cropName: string
  trend: 'up' | 'down' | 'stable'
  changePct: number
  note: string
}
export interface PlantationVsMarket {
  cropName: string
  ourStatus: string
  marketStatus: string
  alignment: string
}
export interface TunnelHealthScore {
  tunnelId: string
  tunnelName: string
  score: number
  dataAvailable: boolean
  summary: string
}
export interface TunnelIssue {
  issue: string
  rootCauses: string[]
  correctiveActions: string[]
  preventiveMeasures: string[]
  priority: string
  expectedImpact: string
}
export interface TunnelAnalysis {
  tunnelId: string
  tunnelName: string
  cropName: string
  currentHealth: string
  growthAbnormalities: string[]
  pestDiseaseSymptoms: string[]
  environmentalIssues: string[]
  yieldRisk: string
  issues: TunnelIssue[]
}
export interface ActionItem {
  description: string
  priority: string
  tunnelName: string | null
}
export interface RiskAlert {
  description: string
  severity: string
  tunnelName: string | null
}
export interface HartiAnalysis {
  hartiSummary: string
  cropMarketTrends: CropMarketTrend[]
  plantationVsMarket: PlantationVsMarket[]
  // Absent on a report saved by the Monday cron before anyone has viewed the
  // HARTI page that week - tunnel photo logs live in browser localStorage,
  // which the server-side cron can't read.
  tunnelHealthScores?: TunnelHealthScore[]
  tunnels?: TunnelAnalysis[]
  actionItems: ActionItem[]
  riskAlerts: RiskAlert[]
}
