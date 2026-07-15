import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Severity } from '@/lib/types'

export const runtime = 'nodejs'

// Lets an existing log entry's assessment be filled in after the fact - e.g.
// when the automatic AI vision call failed or was skipped at upload time but
// the photo itself was still saved, so it can be re-analyzed later without
// asking the field officer to re-upload.
interface PatchBody {
  healthAssessment?: string
  detectedIssues?: string[]
  recommendedActions?: string[]
  severity?: Severity
  analyzedBy?: string
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body: PatchBody = await request.json()

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('tunnel_photo_logs')
    .update({
      health_assessment: body.healthAssessment || null,
      detected_issues: body.detectedIssues || [],
      recommended_actions: body.recommendedActions || [],
      severity: body.severity || null,
      analyzed_by: body.analyzedBy || null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
