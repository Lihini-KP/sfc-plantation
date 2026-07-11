import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { areas } from '@/lib/mock-data/areas'
import { crops } from '@/lib/mock-data/crops'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { HARTI_BULLETIN_META, hartiCropMarket, HARTI_UNTRACKED_CROPS } from '@/lib/mock-data/hartiMarketData'

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
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI analysis is not configured. Add ANTHROPIC_API_KEY to .env.local (and Netlify env vars for production).' },
      { status: 503 }
    )
  }

  const body: { tunnelPhotoData?: TunnelPhotoSummary[] } = await request.json()
  const tunnelPhotoData = body.tunnelPhotoData || []

  const plantationAreas = areas.map((a) => {
    const crop = crops.find((c) => c.id === a.cropId)
    return {
      zone: a.name,
      crop: crop?.name || 'none (crop-free)',
      plantCount: a.plantCount,
      growthStage: a.growthStage,
      healthStatus: a.healthStatus,
      diseaseStatus: a.diseaseStatus,
      pestStatus: a.pestStatus,
      expectedHarvestDate: a.expectedHarvestDate,
    }
  })

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

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = `You are an agricultural market-intelligence and crop-health analysis engine for the Silk Food Ceylon estate (SRV/Silk Route Ventures). You compare our real plantation/tunnel data against HARTI (Hector Kobbekaduwa Agrarian Research and Training Institute) national market data and produce a structured analysis.

HARTI BULLETIN (real data, source: ${HARTI_BULLETIN_META.sourceUrl}):
${HARTI_BULLETIN_META.note}
Edition: ${HARTI_BULLETIN_META.month} ${HARTI_BULLETIN_META.year}, Vol. ${HARTI_BULLETIN_META.volume} No. ${HARTI_BULLETIN_META.issueNumber}

HARTI market data by commodity (real prices in Rs/kg or Rs/fruit unless noted):
${JSON.stringify(hartiCropMarket, null, 2)}

Crops we grow that HARTI does NOT track (no market reference exists - do not invent trends for these):
${HARTI_UNTRACKED_CROPS.join(', ')}

OUR REAL PLANTATION AREAS (open-field crop zones):
${JSON.stringify(plantationAreas, null, 2)}

OUR REAL GREENHOUSE TUNNELS (financials from the Annual Crop Plan sheet):
${JSON.stringify(tunnelFinancials, null, 2)}

OUR REAL TUNNEL PHOTO INSPECTION LOGS (from weekly AI vision reviews, may be empty if no photos uploaded yet for a tunnel):
${JSON.stringify(tunnelPhotoData, null, 2)}

Produce a JSON object (no markdown fences, no extra text) with EXACTLY this shape:
{
  "hartiSummary": string (2-4 sentence overview of the HARTI bulletin's relevant highlights),
  "cropMarketTrends": [{ "cropName": string, "trend": "up"|"down"|"stable", "changePct": number, "note": string }],
  "plantationVsMarket": [{ "cropName": string, "ourStatus": string, "marketStatus": string, "alignment": string }],
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
  "actionItems": [{ "description": string, "priority": "Low"|"Medium"|"High"|"Critical", "tunnelName": string|null }],
  "riskAlerts": [{ "description": string, "severity": "Low"|"Medium"|"High"|"Critical", "tunnelName": string|null }]
}

Rules:
- Only compare crops against HARTI data where a real match exists (chili/Muriya, banana, mango, papaya, passion fruit). For untracked crops, note in plantationVsMarket that no market reference exists rather than inventing one.
- Base tunnel health/issues ONLY on the real photo inspection logs and financials provided - if a tunnel has no photo log yet, say so plainly (e.g. "No photo inspection logged yet - health cannot be assessed") rather than guessing, and set that tunnel's tunnelHealthScores "dataAvailable" to false (score can be 0, it will not be displayed).
- If a tunnel's data shows no real issues, keep "issues" as an empty array for it rather than inventing problems.
- Ground every recommendation in the actual data provided, not generic agronomy advice disconnected from what's shown.`

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8000,
      thinking: { type: 'disabled' },
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate the HARTI Market Intelligence analysis now.' }],
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `AI analysis request failed: ${detail}` }, { status: 502 })
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'AI analysis returned no readable response.' }, { status: 502 })
  }

  const jsonMatch = /\{[\s\S]*\}/.exec(textBlock.text)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'AI analysis response was not valid JSON.' }, { status: 502 })
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ analysis: parsed, bulletinMeta: HARTI_BULLETIN_META })
  } catch {
    return NextResponse.json({ error: 'AI analysis response could not be parsed.' }, { status: 502 })
  }
}
