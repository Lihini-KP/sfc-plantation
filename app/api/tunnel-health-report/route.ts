import { NextResponse } from 'next/server'
import { sendTunnelHealthReport } from '@/lib/tunnel-summary'

export const runtime = 'nodejs'

// Manual re-trigger - e.g. to send a report from already-saved tunnel data
// without needing a new photo upload to fire it.
export async function POST() {
  const result = await sendTunnelHealthReport()
  return NextResponse.json(result)
}
