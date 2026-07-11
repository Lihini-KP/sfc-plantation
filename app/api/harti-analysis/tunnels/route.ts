import { NextResponse } from 'next/server'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { generateHartiJSON } from '@/lib/harti-ai'

export const runtime = 'nodejs'

interface TunnelPhotoSummary {
  tunnelId: string
  tunnelName: string
  cropName: string
  sqft: number
  logCount: number
  latestLog: {
    date: string
    healthAssessment?: string
    detectedIssues?: string[]
    recommendedActions?: string[]
    severity?: string
  } | null
}

export async function POST(request: Request) {
  const body: { tunnelPhotoData?: TunnelPhotoSummary[] } = await request.json()
  const tunnelPhotoData = body.tunnelPhotoData || []

  const tunnelFinancials = greenhouses.map((g) => ({
    tunnelId: g.id,
    tunnel: g.tunnel,
    cropName: g.cropName,
    sqft: g.sqft,
    plantingDate: g.plantingDate,
    firstHarvestDate: g.firstHarvestDate,
    harvestedQtyRange: g.harvestedQtyRange,
    revenue: g.revenue,
    totalExpenses: g.totalExpenses,
    dateOfCropRemoval: g.dateOfCropRemoval,
    nextCropPlantingDate: g.nextCropPlantingDate,
  }))

  const systemPrompt = `You are a per-tunnel crop-health diagnostic engine for the Silk Food Ceylon estate's greenhouse tunnels. Base your analysis ONLY on the real data below.

OUR REAL GREENHOUSE TUNNELS (financials from the Annual Crop Plan sheet):
${JSON.stringify(tunnelFinancials, null, 2)}

OUR REAL TUNNEL PHOTO INSPECTION LOGS (from weekly AI vision reviews, may be empty if no photos uploaded yet for a tunnel):
${JSON.stringify(tunnelPhotoData, null, 2)}

Produce a JSON object (no markdown fences, no extra text) with EXACTLY this shape:
{
  "tunnelHealthScores": [{ "tunnelId": string, "tunnelName": string, "score": number (0-100), "dataAvailable": boolean, "summary": string }],
  "tunnels": [{
    "tunnelId": string, "tunnelName": string, "cropName": string,
    "currentHealth": string,
    "growthAbnormalities": string[],
    "pestDiseaseSymptoms": string[],
    "environmentalIssues": string[],
    "yieldRisk": "Low"|"Medium"|"High"|"Critical",
    "issues": [{
      "issue": string,
      "rootCauses": string[],
      "correctiveActions": string[],
      "preventiveMeasures": string[],
      "priority": "Low"|"Medium"|"High"|"Critical",
      "expectedImpact": string
    }]
  }],
  "actionItems": [{ "description": string, "priority": "Low"|"Medium"|"High"|"Critical", "tunnelName": string }],
  "riskAlerts": [{ "description": string, "severity": "Low"|"Medium"|"High"|"Critical", "tunnelName": string }]
}

Rules:
- Base tunnel health/issues ONLY on the real photo inspection logs and financials provided - if a tunnel has no photo log yet, say so plainly in "currentHealth" (e.g. "No photo inspection logged yet") rather than guessing, set that tunnel's "issues" to an EMPTY array (do not create an issue just to say data is missing), and set tunnelHealthScores "dataAvailable" to false (score can be 0, it will not be displayed). Cover the "no photo data" gap ONCE with a single top-level actionItem listing all affected tunnels, not per-tunnel.
- If a tunnel's data shows no real issues, keep "issues" as an empty array for it rather than inventing problems.
- Ground every recommendation in the actual data provided, not generic agronomy advice disconnected from what's shown.
- BE EXTREMELY TERSE. Every string field must be one short sentence (under 15 words) or a short phrase. Arrays should have at most 2-3 items each. Max 5 actionItems and 4 riskAlerts total. This is a speed-critical request - do not write paragraphs anywhere.`

  const result = await generateHartiJSON(systemPrompt, 'Generate the per-tunnel diagnostic analysis now. Be extremely terse.', 2800)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ analysis: result.data })
}
