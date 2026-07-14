// Shared core for the weekly HARTI Passion Fruit + Moringa analysis - called
// both by the on-demand API route (app/api/harti-analysis/market) and the
// Netlify scheduled function that regenerates it every Monday
// (netlify/functions/harti-weekly-cron.ts). Kept dependency-free of Next.js
// request/response types and using relative imports only, since the
// scheduled function bundles this file outside the Next.js build.

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { fetchLatestHartiWeeklyBulletin } from './harti-weekly-fetch'
import { areas } from './mock-data/areas'
import { crops } from './mock-data/crops'

const WEEKLY_SOURCE_URL = 'https://www.harti.gov.lk/weekly-price.php'

function adminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.')
  return createClient(url, key, { auth: { persistSession: false } })
}

interface WeeklySource {
  weekStart: string
  weekEnd: string
  bulletinVolume: number | null
  bulletinIssue: number | null
  pdfUrl: string
  passionFruitWholesale: {
    rangeLowRs: number
    rangeHighRs: number
    avgThisWeekRs: number
    avgLastWeekRs: number
    avgSameWeekLastYearRs: number
  }
}

async function getWeeklySource(): Promise<{ source: WeeklySource; usedFallback: boolean; fallbackReason?: string }> {
  try {
    const source = await fetchLatestHartiWeeklyBulletin()
    return { source, usedFallback: false }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Unknown fetch/parse error'
    const supabase = adminClient()
    const { data, error } = await supabase
      .from('harti_weekly_source')
      .select('*')
      .order('week_end', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) {
      throw new Error(`Could not fetch this week's HARTI bulletin (${reason}) and no previously saved snapshot exists.`)
    }
    return {
      source: {
        weekStart: data.week_start,
        weekEnd: data.week_end,
        bulletinVolume: data.bulletin_volume,
        bulletinIssue: data.bulletin_issue,
        pdfUrl: data.pdf_url,
        passionFruitWholesale: {
          rangeLowRs: Number(data.wholesale_range_low),
          rangeHighRs: Number(data.wholesale_range_high),
          avgThisWeekRs: Number(data.wholesale_avg_this_week),
          avgLastWeekRs: Number(data.wholesale_avg_last_week),
          avgSameWeekLastYearRs: Number(data.wholesale_avg_same_week_last_year),
        },
      },
      usedFallback: true,
      fallbackReason: reason,
    }
  }
}

async function callClaude(systemPrompt: string, userMessage: string, maxTokens: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.')
  const anthropic = new Anthropic({ apiKey })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: maxTokens,
    thinking: { type: 'disabled' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('AI analysis returned no readable response.')

  // A cut-off response (ran out of max_tokens mid-object) is the most common
  // real cause of "invalid JSON" - surface that distinctly rather than a
  // generic parse-failure message.
  if (message.stop_reason === 'max_tokens') {
    throw new Error('AI analysis was cut off because it ran out of response length (max_tokens) - try again, or this route needs a higher token limit.')
  }

  const raw = textBlock.text.trim()
  const candidates = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim(),
    /\{[\s\S]*\}/.exec(raw)?.[0],
  ].filter((c): c is string => Boolean(c))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch { /* try next candidate */ }
  }

  console.error('HARTI weekly AI response could not be parsed as JSON:', raw.slice(0, 2000))
  throw new Error('AI analysis response could not be parsed.')
}

export async function generateAndSaveWeeklyAnalysis() {
  const { source, usedFallback, fallbackReason } = await getWeeklySource()
  const supabase = adminClient()
  let saveWarning: string | undefined

  if (!usedFallback) {
    const { error: sourceSaveError } = await supabase.from('harti_weekly_source').upsert({
      week_start: source.weekStart,
      week_end: source.weekEnd,
      bulletin_volume: source.bulletinVolume,
      bulletin_issue: source.bulletinIssue,
      pdf_url: source.pdfUrl,
      wholesale_range_low: source.passionFruitWholesale.rangeLowRs,
      wholesale_range_high: source.passionFruitWholesale.rangeHighRs,
      wholesale_avg_this_week: source.passionFruitWholesale.avgThisWeekRs,
      wholesale_avg_last_week: source.passionFruitWholesale.avgLastWeekRs,
      wholesale_avg_same_week_last_year: source.passionFruitWholesale.avgSameWeekLastYearRs,
    }, { onConflict: 'week_start,week_end' })
    if (sourceSaveError) saveWarning = `Could not save this week's source figures: ${sourceSaveError.message}`
  }

  const { avgThisWeekRs, avgLastWeekRs, avgSameWeekLastYearRs, rangeLowRs, rangeHighRs } = source.passionFruitWholesale
  const changeWoWPct = Number((((avgThisWeekRs - avgLastWeekRs) / avgLastWeekRs) * 100).toFixed(2))
  const changeYoYPct = Number((((avgThisWeekRs - avgSameWeekLastYearRs) / avgSameWeekLastYearRs) * 100).toFixed(2))

  const passionArea = areas.find((a) => a.id === 'area-passion')
  const passionCrop = crops.find((c) => c.id === passionArea?.cropId)
  const ourPassionFruit = passionArea && {
    zone: passionArea.name,
    plantCount: passionArea.plantCount,
    growthStage: passionArea.growthStage,
    healthStatus: passionArea.healthStatus,
    diseaseStatus: passionArea.diseaseStatus,
    pestStatus: passionArea.pestStatus,
    expectedHarvestDate: passionArea.expectedHarvestDate,
    aiHealthScore: passionArea.aiHealthScore,
    harvestSchedule: passionCrop?.growthStage,
  }

  const moringaArea = areas.find((a) => a.id === 'area-moringa')
  const moringaCrop = crops.find((c) => c.id === moringaArea?.cropId)
  const ourMoringa = moringaArea && {
    zone: moringaArea.name,
    plantCount: moringaArea.plantCount,
    growthStage: moringaArea.growthStage,
    healthStatus: moringaArea.healthStatus,
    diseaseStatus: moringaArea.diseaseStatus,
    pestStatus: moringaArea.pestStatus,
    expectedHarvestDate: moringaArea.expectedHarvestDate,
    aiHealthScore: moringaArea.aiHealthScore,
    harvestSchedule: moringaCrop?.growthStage,
  }

  const systemPrompt = `You are an agricultural market-intelligence engine for the Silk Food Ceylon estate (SRV/Silk Route Ventures). Compare our real open-field Passion Fruit and Moringa plots against HARTI's (Hector Kobbekaduwa Agrarian Research and Training Institute) REAL WEEKLY Food Commodities Bulletin. Cover Passion Fruit and Moringa ONLY - no other crop.

HARTI WEEKLY BULLETIN (real data, Colombo Wholesale, source: ${WEEKLY_SOURCE_URL}):
Week: ${source.weekStart} to ${source.weekEnd}${source.bulletinVolume ? ` (Vol. ${source.bulletinVolume}${source.bulletinIssue ? `, No. ${source.bulletinIssue}` : ''})` : ''}
Passion Fruit wholesale price range: Rs ${rangeLowRs.toFixed(2)} - ${rangeHighRs.toFixed(2)}/kg
Average this week: Rs ${avgThisWeekRs.toFixed(2)}/kg
Average last week: Rs ${avgLastWeekRs.toFixed(2)}/kg (week-on-week change: ${changeWoWPct}%)
Average same week last year: Rs ${avgSameWeekLastYearRs.toFixed(2)}/kg (year-on-year change: ${changeYoYPct}%)

HARTI does NOT publish any market price data for Moringa - do not invent a price or trend for it.

OUR REAL PASSION FRUIT PLOT:
${JSON.stringify(ourPassionFruit, null, 2)}

OUR REAL MORINGA PLOT:
${JSON.stringify(ourMoringa, null, 2)}

Produce a JSON object (no markdown fences, no extra text) with EXACTLY this shape:
{
  "hartiSummary": string (2-4 sentence overview of this week's Passion Fruit wholesale price movement, plus one sentence noting Moringa has no HARTI market reference),
  "cropMarketTrends": [{ "cropName": "Passion Fruit", "trend": "up"|"down"|"stable", "changePct": ${changeWoWPct}, "note": string }],
  "plantationVsMarket": [
    { "cropName": "Passion Fruit", "ourStatus": string, "marketStatus": string, "alignment": string },
    { "cropName": "Moringa", "ourStatus": string, "marketStatus": "No HARTI market reference for Moringa", "alignment": string }
  ],
  "actionItems": [{ "description": string, "priority": "Low"|"Medium"|"High"|"Critical", "tunnelName": null }],
  "riskAlerts": [{ "description": string, "severity": "Low"|"Medium"|"High"|"Critical", "tunnelName": null }]
}

Rules:
- Use the exact changePct value ${changeWoWPct} provided above for cropMarketTrends - do not recompute or alter it.
- Cover Passion Fruit and Moringa ONLY. plantationVsMarket has exactly TWO entries, one per crop.
- For Moringa, "marketStatus" must stay exactly "No HARTI market reference for Moringa" - base "ourStatus"/"alignment" only on our real plantation data.
- Our Passion Fruit plot is currently critical health (Fusarium wilt, fruit fly) - factor that into ourStatus/actionItems/riskAlerts realistically.
- Keep "tunnelName" null here. Max 3 actionItems and 3 riskAlerts total across both crops.
- Ground every recommendation in the actual data provided, not generic agronomy advice disconnected from what's shown.
- BE EXTREMELY TERSE. Every string field must be one short sentence (under 20 words). hartiSummary max 3 sentences. This is a speed-critical request - do not write paragraphs anywhere.`

  const analysis = await callClaude(systemPrompt, 'Generate this week\'s HARTI Passion Fruit and Moringa comparison now. Be extremely terse.', 1400)

  const { error: analysisSaveError } = await supabase.from('harti_weekly_analysis').upsert({
    week_start: source.weekStart,
    week_end: source.weekEnd,
    analysis,
  }, { onConflict: 'week_start,week_end' })
  if (analysisSaveError) {
    saveWarning = saveWarning
      ? `${saveWarning}; could not save this week's analysis: ${analysisSaveError.message}`
      : `Could not save this week's analysis to history: ${analysisSaveError.message}`
  }

  return {
    weekStart: source.weekStart,
    weekEnd: source.weekEnd,
    bulletinVolume: source.bulletinVolume,
    bulletinIssue: source.bulletinIssue,
    pdfUrl: source.pdfUrl,
    usedFallback,
    fallbackReason,
    saveWarning,
    analysis,
  }
}
