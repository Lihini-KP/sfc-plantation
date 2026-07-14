// Netlify Scheduled Function - regenerates the HARTI weekly Passion Fruit +
// Moringa analysis every Monday so the report is fresh without anyone
// needing to open the app (schedule set in netlify.toml). Uses relative
// imports (not the "@/" tsconfig alias) since this function is bundled
// separately from the Next.js app.
import type { Handler } from '@netlify/functions'
import { generateAndSaveWeeklyAnalysis } from '../../lib/harti-weekly-analysis'

export const handler: Handler = async () => {
  try {
    const result = await generateAndSaveWeeklyAnalysis()
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
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }),
    }
  }
}
