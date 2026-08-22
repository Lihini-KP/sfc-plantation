// Netlify Scheduled Function - regenerates the HARTI weekly Passion Fruit +
// Moringa analysis every Monday so the report is fresh without anyone
// needing to open the app (schedule set in netlify.toml). Uses relative
// imports (not the "@/" tsconfig alias) since this function is bundled
// separately from the Next.js app.
//
// Reports every run (success AND failure) to SPINE's atlas.agent_runs via
// the public log_agent_run RPC, called through the atlas-agent-run?action=log
// endpoint (same proven pattern already landing real rows for the
// 'plantation-pulse' agent - see app/api/automation/pulse/route.ts). The
// earlier attempt at this (lib/agent-report.ts, posting to atlas-agent-run
// WITHOUT ?action=log, and using an invalid status value 'error') never
// actually created an agent or landed a run - confirmed zero rows for any
// plantation-mgt key as of 2026-08-16. log_agent_run only accepts
// 'running'|'success'|'failed'|'partial' and requires the agent_key to
// already exist in atlas.agents; ?action=log self-registers/upserts it from
// the metadata fields below on every call, so the first real call here is
// also the registration.
import type { Handler } from '@netlify/functions'
import { generateAndSaveWeeklyAnalysis } from '../../lib/harti-weekly-analysis'
import { pushTask } from '../../lib/atlas-task'

const AGENT_KEY = 'plantation-harti-weekly'
const AGENT_RUN_URL = 'https://srv-spine.netlify.app/.netlify/functions/atlas-agent-run?action=log'

async function reportRun(
  status: 'success' | 'failed' | 'partial',
  summary: string,
  opts: { error?: string; metrics?: Record<string, unknown> } = {}
) {
  const token = process.env.ATLAS_AGENT_TOKEN
  if (!token) {
    console.log(`[harti-weekly-cron] ATLAS_AGENT_TOKEN not set - skipping agent-run report (${status}: ${summary})`)
    return
  }
  try {
    const res = await fetch(AGENT_RUN_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        agent_key: AGENT_KEY,
        name: 'HARTI Weekly Market Intelligence',
        kind: 'scheduled',
        company: 'SFC',
        source: 'plantation-mgt',
        app_key: 'plantation',
        expected_cadence: 'weekly',
        cadence_seconds: 604800,
        status,
        summary,
        error: opts.error,
        metrics: opts.metrics,
      }),
    })
    if (!res.ok) console.error('[harti-weekly-cron] agent-run report failed', res.status, await res.text())
  } catch (err) {
    console.error('[harti-weekly-cron] agent-run report fetch error', err)
  }
}

export const handler: Handler = async () => {
  try {
    const result = await generateAndSaveWeeklyAnalysis()
    const degradedReason = [result.usedFallback ? result.fallbackReason || 'used fallback - live fetch/parse failed' : null, result.saveWarning]
      .filter(Boolean)
      .join('; ')
    const summary = `HARTI weekly analysis for ${result.weekStart}..${result.weekEnd}${degradedReason ? ' (degraded)' : ''}`

    await reportRun(degradedReason ? 'partial' : 'success', summary, {
      error: degradedReason || undefined,
      metrics: { week_start: result.weekStart, week_end: result.weekEnd, used_fallback: result.usedFallback },
    })

    if (degradedReason) {
      await pushTask({
        source: 'plantation-mgt',
        title: 'HARTI weekly report degraded',
        description: degradedReason,
        assignee: { email: 'hra@esilkroute.com.lk' },
        dedup_key: `${AGENT_KEY}-degraded`,
        status: 'Pending',
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        weekStart: result.weekStart,
        weekEnd: result.weekEnd,
        usedFallback: result.usedFallback,
      }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await reportRun('failed', 'HARTI weekly analysis failed', { error: message })
    await pushTask({
      source: 'plantation-mgt',
      title: 'HARTI weekly report generation failed',
      description: message,
      assignee: { email: 'hra@esilkroute.com.lk' },
      dedup_key: `${AGENT_KEY}-failure`,
      status: 'Pending',
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: message }),
    }
  }
}
