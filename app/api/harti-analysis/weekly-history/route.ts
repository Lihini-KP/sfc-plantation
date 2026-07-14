import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { HartiAnalysis } from '@/lib/harti-types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 12, 500)

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('harti_weekly_analysis')
    .select('week_start, week_end, analysis, generated_at')
    .order('week_end', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({
    weeks: (data || []).map((row) => ({
      weekStart: row.week_start,
      weekEnd: row.week_end,
      generatedAt: row.generated_at,
      analysis: row.analysis,
    })),
  })
}

// Upserts the full merged (market + tunnel) analysis for a week - called by
// HartiMarketClient once both halves of a live run are ready, so the saved
// snapshot for that week is as complete as whatever the Monday cron wrote
// (market-only, since it has no browser localStorage to read tunnel photos
// from).
export async function POST(request: Request) {
  const body: { weekStart?: string; weekEnd?: string; analysis?: HartiAnalysis } = await request.json()
  if (!body.weekStart || !body.weekEnd || !body.analysis) {
    return NextResponse.json({ error: 'weekStart, weekEnd and analysis are required.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('harti_weekly_analysis').upsert({
    week_start: body.weekStart,
    week_end: body.weekEnd,
    analysis: body.analysis,
  }, { onConflict: 'week_start,week_end' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
