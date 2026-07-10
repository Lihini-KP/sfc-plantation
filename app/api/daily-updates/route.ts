import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { DailyUpdate } from '@/lib/types'

function toRow(u: Omit<DailyUpdate, 'id'>) {
  return {
    date: u.date,
    area_id: u.areaId,
    crop_id: u.cropId,
    activity: u.activity,
    staff: u.staff,
    weather: u.weather,
    watering_details: u.wateringDetails,
    fertilizer_applied: u.fertilizerApplied,
    pesticide_applied: u.pesticideApplied,
    diseases_found: u.diseasesFound,
    pest_issues: u.pestIssues,
    notes: u.notes,
    photo_count: u.photoCount,
  }
}

function fromRow(row: {
  id: string; date: string; area_id: string; crop_id: string; activity: string; staff: string[]
  weather: string; watering_details: string; fertilizer_applied: string; pesticide_applied: string
  diseases_found: string; pest_issues: string; notes: string; photo_count: number
}): DailyUpdate {
  return {
    id: row.id,
    date: row.date,
    areaId: row.area_id,
    cropId: row.crop_id,
    activity: row.activity,
    staff: row.staff || [],
    weather: row.weather,
    wateringDetails: row.watering_details,
    fertilizerApplied: row.fertilizer_applied,
    pesticideApplied: row.pesticide_applied,
    diseasesFound: row.diseases_found,
    pestIssues: row.pest_issues,
    notes: row.notes,
    photoCount: row.photo_count,
  }
}

export async function GET() {
  let supabase
  try {
    supabase = createSupabaseAdminClient()
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Supabase not configured.' }, { status: 503 })
  }

  const { data, error } = await supabase.from('daily_updates').select('*').order('date', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ updates: (data || []).map(fromRow) })
}

export async function POST(request: Request) {
  let supabase
  try {
    supabase = createSupabaseAdminClient()
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Supabase not configured.' }, { status: 503 })
  }

  const body: Omit<DailyUpdate, 'id'> = await request.json()
  const { data, error } = await supabase.from('daily_updates').insert(toRow(body)).select().single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ update: fromRow(data) })
}
