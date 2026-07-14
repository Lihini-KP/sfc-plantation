import { NextResponse } from 'next/server'
import { generateAndSaveWeeklyAnalysis } from '@/lib/harti-weekly-analysis'

export const runtime = 'nodejs'

// Scope narrowed to Passion Fruit + Moringa only, per explicit request. Note:
// the 5 greenhouse tunnels actually grow Muriya/Hot Dragon, NOT Passion Fruit -
// Passion Fruit and Moringa are real open-field plots (area-passion,
// area-moringa) - tunnels are covered by the separate per-tunnel diagnostics
// route. Uses HARTI's real WEEKLY bulletin (fetched live), not the older
// monthly one, and saves each week's result so a history builds up over time
// (also regenerated automatically every Monday - see
// netlify/functions/harti-weekly-cron.ts).
export async function POST() {
  try {
    const result = await generateAndSaveWeeklyAnalysis()
    return NextResponse.json({
      analysis: result.analysis,
      bulletinMeta: {
        weekStart: result.weekStart,
        weekEnd: result.weekEnd,
        bulletinVolume: result.bulletinVolume,
        bulletinIssue: result.bulletinIssue,
        pdfUrl: result.pdfUrl,
        sourceUrl: 'https://www.harti.gov.lk/weekly-price.php',
        usedFallback: result.usedFallback,
        fallbackReason: result.fallbackReason,
        saveWarning: result.saveWarning,
        wholesaleAvgThisWeekRs: result.wholesaleAvgThisWeekRs,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'HARTI weekly analysis failed.' }, { status: 502 })
  }
}
