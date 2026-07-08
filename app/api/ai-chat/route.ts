import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { areas } from '@/lib/mock-data/areas'
import { crops } from '@/lib/mock-data/crops'
import { aiAnalyses } from '@/lib/mock-data/aiInsights'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI chat is not configured. Add ANTHROPIC_API_KEY to .env.local (and Netlify env vars for production).' },
      { status: 503 }
    )
  }

  const { question } = await request.json()
  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'No question provided.' }, { status: 400 })
  }

  const zoneContext = areas.map((a) => {
    const crop = crops.find((c) => c.id === a.cropId)
    const analysis = aiAnalyses.find((an) => an.areaId === a.id)
    return {
      zone: a.name,
      crop: crop?.name || 'none (crop-free)',
      variety: a.variety,
      plantCount: a.plantCount,
      healthStatus: a.healthStatus,
      growthStage: a.growthStage,
      diseaseStatus: a.diseaseStatus,
      pestStatus: a.pestStatus,
      ...(analysis
        ? {
            aiHealthScore: analysis.healthScore,
            severity: analysis.severity,
            detectedProblems: analysis.detectedProblems,
            recommendedActions: analysis.recommendedActions,
            harvestReadinessPct: analysis.harvestReadinessPct,
            expectedHarvestDate: analysis.expectedHarvestDate,
            nextFertilizer: analysis.nextFertilizer,
            irrigationRecommendation: analysis.irrigationRecommendation,
          }
        : {}),
    }
  })

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = `You are an assistant embedded in a plantation management app for the Silk Food Ceylon estate (SRV/Silk Route Ventures). You answer questions about specific crop zones using the per-zone data provided below. This data is illustrative sample data for a prototype (not from a live sensor/vision pipeline yet) - you don't need to repeat that disclaimer unless directly relevant to the answer.

Zone data (JSON):
${JSON.stringify(zoneContext, null, 2)}

Answer the user's question specifically and practically using this data. If they ask about a zone/crop that isn't in the data, say so honestly instead of guessing or substituting a different zone. Keep answers concise (2-5 sentences unless more detail is clearly needed).`

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `AI chat request failed: ${detail}` }, { status: 502 })
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'AI chat returned no readable response.' }, { status: 502 })
  }

  return NextResponse.json({ reply: textBlock.text })
}
