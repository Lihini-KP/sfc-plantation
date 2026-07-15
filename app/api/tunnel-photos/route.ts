import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Severity } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tunnelId = searchParams.get('tunnelId')

  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('tunnel_photo_logs')
    .select('id, tunnel_id, date, photos, health_assessment, detected_issues, recommended_actions, severity, analyzed_by')
    .order('date', { ascending: false })

  if (tunnelId) query = query.eq('tunnel_id', tunnelId)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({
    logs: (data || []).map((row) => ({
      id: row.id,
      tunnelId: row.tunnel_id,
      date: row.date,
      photos: row.photos || [],
      healthAssessment: row.health_assessment || undefined,
      detectedIssues: row.detected_issues?.length ? row.detected_issues : undefined,
      recommendedActions: row.recommended_actions?.length ? row.recommended_actions : undefined,
      severity: row.severity || undefined,
      analyzedBy: row.analyzed_by || undefined,
    })),
  })
}

// Every tunnel photo upload (from any device/user) is saved here, so the log
// is shared across everyone viewing the tunnel - not trapped in the
// uploading device's browser storage.
interface TunnelPhotoLogBody {
  tunnelId?: string
  date?: string
  photos?: string[]
  healthAssessment?: string
  detectedIssues?: string[]
  recommendedActions?: string[]
  severity?: Severity
  analyzedBy?: string
}

export async function POST(request: Request) {
  const body: TunnelPhotoLogBody = await request.json()
  if (!body.tunnelId || !body.date || !body.photos || body.photos.length === 0) {
    return NextResponse.json({ error: 'tunnelId, date and at least one photo are required.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('tunnel_photo_logs')
    .insert({
      tunnel_id: body.tunnelId,
      date: body.date,
      photos: body.photos,
      health_assessment: body.healthAssessment || null,
      detected_issues: body.detectedIssues || [],
      recommended_actions: body.recommendedActions || [],
      severity: body.severity || null,
      analyzed_by: body.analyzedBy || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
