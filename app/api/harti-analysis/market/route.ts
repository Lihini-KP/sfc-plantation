import { NextResponse } from 'next/server'
import { areas } from '@/lib/mock-data/areas'
import { crops } from '@/lib/mock-data/crops'
import { greenhouses } from '@/lib/mock-data/greenhouses'
import { HARTI_BULLETIN_META, hartiCropMarket, HARTI_UNTRACKED_CROPS } from '@/lib/mock-data/hartiMarketData'
import { generateHartiJSON } from '@/lib/harti-ai'

export const runtime = 'nodejs'

export async function POST() {
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

  const tunnelFinancialsSummary = greenhouses.map((g) => ({
    tunnel: g.tunnel, cropName: g.cropName, sqft: g.sqft, revenue: g.revenue, totalExpenses: g.totalExpenses,
  }))

  const systemPrompt = `You are an agricultural market-intelligence engine for the Silk Food Ceylon estate (SRV/Silk Route Ventures). Compare our real open-field plantation areas against HARTI (Hector Kobbekaduwa Agrarian Research and Training Institute) national market data.

HARTI BULLETIN (real data, source: ${HARTI_BULLETIN_META.sourceUrl}):
${HARTI_BULLETIN_META.note}
Edition: ${HARTI_BULLETIN_META.month} ${HARTI_BULLETIN_META.year}, Vol. ${HARTI_BULLETIN_META.volume} No. ${HARTI_BULLETIN_META.issueNumber}

HARTI market data by commodity (real prices in Rs/kg or Rs/fruit unless noted):
${JSON.stringify(hartiCropMarket, null, 2)}

Crops we grow that HARTI does NOT track (no market reference exists - do not invent trends for these):
${HARTI_UNTRACKED_CROPS.join(', ')}

OUR REAL PLANTATION AREAS (open-field crop zones):
${JSON.stringify(plantationAreas, null, 2)}

OUR REAL GREENHOUSE TUNNEL FINANCIALS SUMMARY (detailed tunnel health is analyzed separately - only use this for context on chili/Muriya market exposure):
${JSON.stringify(tunnelFinancialsSummary, null, 2)}

Produce a JSON object (no markdown fences, no extra text) with EXACTLY this shape:
{
  "hartiSummary": string (2-4 sentence overview of the HARTI bulletin's relevant highlights),
  "cropMarketTrends": [{ "cropName": string, "trend": "up"|"down"|"stable", "changePct": number, "note": string }],
  "plantationVsMarket": [{ "cropName": string, "ourStatus": string, "marketStatus": string, "alignment": string }],
  "actionItems": [{ "description": string, "priority": "Low"|"Medium"|"High"|"Critical", "tunnelName": null }],
  "riskAlerts": [{ "description": string, "severity": "Low"|"Medium"|"High"|"Critical", "tunnelName": null }]
}

Rules:
- Only compare crops against HARTI data where a real match exists (chili/Muriya, banana, mango, papaya, passion fruit). For untracked crops, include ONE combined plantationVsMarket entry (not one per crop) noting no market reference exists.
- actionItems/riskAlerts here should cover open-field area concerns and overall market exposure (e.g. chili price trend vs our tunnel exposure) - keep "tunnelName" null since per-tunnel diagnostics are handled elsewhere. Max 5 actionItems and 4 riskAlerts.
- Ground every recommendation in the actual data provided, not generic agronomy advice disconnected from what's shown.
- BE EXTREMELY TERSE. Every string field must be one short sentence (under 20 words). hartiSummary max 2 sentences. This is a speed-critical request - do not write paragraphs anywhere.`

  const result = await generateHartiJSON(systemPrompt, 'Generate the HARTI market and plantation area comparison now. Be extremely terse.', 1800)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ analysis: result.data, bulletinMeta: HARTI_BULLETIN_META })
}
