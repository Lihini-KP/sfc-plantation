import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { regenerateAndNotify } from '@/lib/daily-summary'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('daily_summaries')
    .select('date, summary, telegram_message_id, sent_photo_urls, generated_at')
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    summaries: (data || []).map((row) => ({
      date: row.date,
      summary: row.summary,
      sentToTelegram: !!row.telegram_message_id,
      photos: row.sent_photo_urls || [],
      generatedAt: row.generated_at,
    })),
  })
}

// Manual re-trigger, e.g. if a summary needs regenerating after the fact.
export async function POST(request: Request) {
  const body: { date?: string } = await request.json()
  if (!body.date) {
    return NextResponse.json({ error: 'date is required.' }, { status: 400 })
  }
  await regenerateAndNotify(body.date)
  return NextResponse.json({ ok: true })
}
