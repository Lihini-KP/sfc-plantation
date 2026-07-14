import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Real Passion Fruit wholesale prices saved each week (harti_weekly_source),
// used to chart an actual historical trend instead of just a single
// week-on-week percentage.
export async function GET() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('harti_weekly_source')
    .select('week_start, week_end, wholesale_avg_this_week')
    .order('week_start', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({
    points: (data || []).map((row) => ({
      weekStart: row.week_start,
      weekEnd: row.week_end,
      avgPriceRs: Number(row.wholesale_avg_this_week),
    })),
  })
}
