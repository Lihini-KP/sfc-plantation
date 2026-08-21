import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

// GET/POST /api/automation/pulse — daily SAGE business pulse (SPINE
// Connect-Kit §6, agent_key 'plantation-pulse').
//
// REPLACES netlify/functions/plantation-pulse.ts (PR #3, merged 2026-08-20),
// which is removed in this same change. That version reported a rolling
// 7-day daily_updates count and always sent status:'success' — it could
// never surface a silent day (Arushika not logging today) because a healthy
// week of updates would mask a quiet today, and 'success' was hardcoded
// regardless of what the numbers said. It was also a Netlify Scheduled
// Function, which on this team's plan arms but does not reliably invoke
// (verified independently on a sibling SFC app 2026-08-19 — schedule
// registered, zero invocations, manual "Run now" and direct HTTP calls both
// blocked with a 403). This route is called instead by pg_cron on SPINE's
// SRV-Workspace Supabase project via net.http_post (that project is not this
// app's own DB — plantation-mgt's Supabase project is on a different
// account this session has no MCP access to — but net.http_post can target
// any HTTPS URL, so the cron job lives there and calls this route).
//
// Sahan's guidance (2026-08-19, verbatim from the task brief): the pulse
// must carry "whether Arushika uploaded photos & info and whether the
// plantation management agent / app is being utilized" — a usage/liveness
// signal, not a rolling average. A silent day is meaningful and must be
// visible as partial/zero-with-reason, never as a bare 'success'.
export const runtime = 'nodejs'

const AGENT_KEY = 'plantation-pulse'
const AGENT_RUN_URL = 'https://srv-spine.netlify.app/.netlify/functions/atlas-agent-run?action=log'

function checkAuth(request: NextRequest): boolean {
  const header = request.headers.get('x-cron-secret')
  const query  = new URL(request.url).searchParams.get('secret')
  const secret = process.env.CRON_SECRET
  return !!secret && (header === secret || query === secret)
}

type DailyUpdateRow = {
  id: string
  staff: string[] | null
  photo_count: number | null
  photos: string[] | null
  activity: string | null
}

async function runPulse(): Promise<NextResponse> {
  const startedAt = Date.now()
  const token = process.env.ATLAS_AGENT_TOKEN
  if (!token) {
    return NextResponse.json({ ok: true, skipped: 'ATLAS_AGENT_TOKEN not set' })
  }

  // "Today" in Sri Lanka (UTC+5:30) — daily_updates.date is a plain date
  // column, same convention the app's own daily-summary job uses.
  const nowSl   = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  const dateStr = nowSl.toISOString().split('T')[0]

  let status: 'success' | 'partial' | 'failed' = 'success'
  let summary = ''
  let error: string | undefined
  let metrics: Record<string, unknown> = {}

  try {
    const supabase = createSupabaseAdminClient()
    const { data, error: qErr } = await supabase
      .from('plantation_daily_updates')
      .select('id, staff, photo_count, photos, activity')
      .eq('date', dateStr)
      .returns<DailyUpdateRow[]>()

    if (qErr) throw new Error(`daily_updates query failed: ${qErr.message}`)

    const rows = data ?? []
    const updatesLogged = rows.length
    const photosUploaded = rows.reduce(
      (sum, r) => sum + (r.photo_count ?? r.photos?.length ?? 0),
      0
    )
    const staffToday = Array.from(
      new Set(rows.flatMap((r) => (r.staff ?? []).map((s) => s.trim()).filter(Boolean)))
    )

    metrics = {
      updates_logged_today: updatesLogged,
      photos_uploaded_today: photosUploaded,
      staff_reported: staffToday,
      date: dateStr,
    }

    if (updatesLogged === 0) {
      status = 'partial'
      summary = `0 daily updates logged for ${dateStr} — no field data or photos uploaded today`
      error = `No daily_updates rows for ${dateStr}: the plantation app was not used today (no field officer, including Arushika, logged an update or photo).`
    } else {
      status = 'success'
      const who = staffToday.length ? ` by ${staffToday.join(', ')}` : ''
      summary = `${updatesLogged} daily update${updatesLogged === 1 ? '' : 's'} logged${who}, ${photosUploaded} photo${photosUploaded === 1 ? '' : 's'} uploaded (${dateStr})`
    }
  } catch (err) {
    status = 'failed'
    error = err instanceof Error ? err.message : String(err)
    summary = 'Pulse query failed'
    console.error('[plantation-pulse]', err)
  }

  let reported = false
  try {
    const res = await fetch(AGENT_RUN_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        agent_key: AGENT_KEY,
        name: 'Plantation Daily Pulse',
        kind: 'scheduled',
        company: 'SFC',
        source: 'plantation-mgt',
        app_key: 'plantation',
        expected_cadence: 'daily',
        cadence_seconds: 86400,
        status,
        summary,
        error: status !== 'success' ? error : undefined,
        metrics,
      }),
    })
    reported = res.ok
    if (!reported) console.error('[plantation-pulse] atlas-agent-run failed', res.status, await res.text())
  } catch (err) {
    console.error('[plantation-pulse] report fetch error', err)
  }

  // Fire-and-forget / fail-open: this endpoint is polled by pg_cron
  // net.http_post, which does not need (or check) anything but a 2xx.
  return NextResponse.json({
    ok: true,
    status,
    summary,
    metrics,
    reported,
    duration_ms: Date.now() - startedAt,
  })
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runPulse()
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runPulse()
}
