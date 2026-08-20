// Netlify Scheduled Function — SPINE Connect-Kit §6 daily business pulse
// (SPINE task pulse-wire-plantation). Distinct from 'plantation-harti-weekly' (a weekly
// report-regeneration job). Reports real 7-day farm-operations KPIs (daily updates logged,
// harvest kg, pending tasks, active crops) once a day under agent key 'plantation-pulse'.
// Uses relative imports (not the "@/" tsconfig alias) since this function is bundled
// separately from the Next.js app, matching harti-weekly-cron.ts.
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const AGENT_KEY = 'plantation-pulse'
const AGENT_RUN_URL = 'https://srv-spine.netlify.app/.netlify/functions/atlas-agent-run?action=log'
const DAY_MS = 24 * 60 * 60 * 1000

export const handler: Handler = async () => {
  const token = process.env.ATLAS_AGENT_TOKEN
  if (!token) return { statusCode: 200, body: JSON.stringify({ ok: true, skipped: 'ATLAS_AGENT_TOKEN not set' }) }

  const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !supaKey) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, skipped: 'SUPABASE env not set' }) }
  }
  const db = createClient(supaUrl, supaKey)
  const since7 = new Date(Date.now() - 7 * DAY_MS).toISOString().slice(0, 10)

  try {
    const [updatesRes, harvestRes, tasksOpenRes, cropsActiveRes] = await Promise.all([
      db.from('daily_updates').select('id', { count: 'exact', head: true }).gte('date', since7),
      db.from('harvest_log').select('quantity_kg').gte('date', since7),
      db.from('plantation_tasks').select('id', { count: 'exact', head: true }).neq('status', 'completed'),
      db.from('crops').select('id', { count: 'exact', head: true }),
    ])

    if (updatesRes.error) throw new Error(`daily_updates count failed: ${updatesRes.error.message}`)
    if (harvestRes.error) throw new Error(`harvest_log load failed: ${harvestRes.error.message}`)
    if (tasksOpenRes.error) throw new Error(`plantation_tasks count failed: ${tasksOpenRes.error.message}`)
    if (cropsActiveRes.error) throw new Error(`crops count failed: ${cropsActiveRes.error.message}`)

    const harvestKg7d = Math.round(
      (harvestRes.data ?? []).reduce((s, r: { quantity_kg: number }) => s + Number(r.quantity_kg ?? 0), 0)
    )

    const metrics = {
      daily_updates_logged_7d: updatesRes.count ?? 0,
      harvest_kg_7d: harvestKg7d,
      tasks_open: tasksOpenRes.count ?? 0,
      crops_tracked: cropsActiveRes.count ?? 0,
    }

    const summary = `${metrics.daily_updates_logged_7d} daily updates logged, ${metrics.harvest_kg_7d}kg harvested in 7d, ${metrics.tasks_open} tasks open`

    const res = await fetch(AGENT_RUN_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        agent_key: AGENT_KEY,
        name: 'Plantation Daily Pulse',
        kind: 'scheduled',
        source: 'plantation-mgt',
        app_key: 'plantation',
        expected_cadence: 'daily',
        cadence_seconds: 86400,
        status: 'success',
        summary,
        metrics,
      }),
    })
    const reported = res.ok
    if (!reported) console.warn(`[plantation-pulse] ATLAS responded ${res.status}`)
    return { statusCode: 200, body: JSON.stringify({ ok: true, reported, metrics }) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[plantation-pulse] failed', message)
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: message }) }
  }
}
