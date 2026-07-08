import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface AnalyzeRequestBody {
  tunnelName: string
  cropName: string
  photos: string[] // data URLs, e.g. "data:image/jpeg;base64,...."
}

interface AnalysisResult {
  healthAssessment: string
  detectedIssues: string[]
  recommendedActions: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  return { mediaType: match[1], base64: match[2] }
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI analysis is not configured. Add ANTHROPIC_API_KEY to .env.local (and to the Netlify site environment variables for production) to enable it.' },
      { status: 503 }
    )
  }

  const body: AnalyzeRequestBody = await request.json()
  const { tunnelName, cropName, photos } = body

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'No photos provided.' }, { status: 400 })
  }

  const imageBlocks = []
  for (const photo of photos) {
    const parsed = parseDataUrl(photo)
    if (!parsed) continue
    imageBlocks.push({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: parsed.mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: parsed.base64 },
    })
  }

  if (imageBlocks.length === 0) {
    return NextResponse.json({ error: 'Photos were not in a readable image format.' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  const prompt = `You are an agronomy assistant reviewing photos from a plantation greenhouse tunnel called "${tunnelName}", currently growing ${cropName}. Look closely at the attached photo(s) - leaf color, fruiting, pests, disease signs, canopy structure, soil/growing medium - and assess plant health.

Respond with ONLY a raw JSON object (no markdown code fences, no extra text) matching exactly this shape:
{"healthAssessment": string, "detectedIssues": string[], "recommendedActions": string[], "severity": "low" | "medium" | "high" | "critical"}

Be specific and reference what is actually visible in the photos. If the photos look healthy with no issues, say so plainly and use "low" severity with an empty detectedIssues array.`

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text' as const, text: prompt }],
        },
      ],
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

  let parsed: AnalysisResult
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    return NextResponse.json({ error: 'AI analysis response could not be parsed.' }, { status: 502 })
  }

  return NextResponse.json(parsed)
}
