import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('harti_weekly_analysis')
    .select('week_start, week_end, analysis, generated_at')
    .order('week_end', { ascending: false })
    .limit(12)

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
