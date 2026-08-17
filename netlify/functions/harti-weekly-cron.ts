// Netlify Scheduled Function - regenerates the HARTI weekly Passion Fruit +
// Moringa analysis every Monday so the report is fresh without anyone
// needing to open the app (schedule set in netlify.toml). Uses relative
// imports (not the "@/" tsconfig alias) since this function is bundled
// separately from the Next.js app.
import type { Handler } from '@netlify/functions'
import { generateAndSaveWeeklyAnalysis } from '../../lib/harti-weekly-analysis'
import { reportAgentRun } from '../../lib/agent-report'
import { pushTask } from '../../lib/atlas-task'

const AGENT_KEY = 'plantation-harti-weekly'

export const handler: Handler = async () => {
  try {
    const result = await generateAndSaveWeeklyAnalysis()
    await reportAgentRun({
      agent_key: AGENT_KEY,
      status: 'success',
      summary: `HARTI weekly analysis for ${result.weekStart}..${result.weekEnd}${result.usedFallback ? ' (used fallback - no newer bulletin published)' : ''}`,
    })
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
    await reportAgentRun({ agent_key: AGENT_KEY, status: 'error', summary: message })
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
