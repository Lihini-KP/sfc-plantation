// Server-only reads for the core plantation reference data (crops, areas,
// facilities, greenhouse tunnels, the Annual Crop Plan). This used to be
// static lib/mock-data imports; now it reads the same real data from
// Supabase (already seeded there) so it's a single source of truth shared
// with any other tool that touches the same tables. Shapes match the
// existing app types exactly so consuming components don't need to change.

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Crop, PlantationArea, FacilityPoint } from '@/lib/types'
import type { GreenhousePlot } from '@/lib/mock-data/greenhouses'
import type { CropPlanRecord } from '@/lib/mock-data/cropPlan'

export async function getCrops(): Promise<Crop[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.from('crops').select('*').order('id')
  if (error || !data) return []
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    variety: c.variety || '',
    plantCount: c.plant_count,
    plantingDate: c.planting_date,
    expectedHarvestDate: c.expected_harvest_date,
    harvestCycleDays: c.harvest_cycle_days,
    growthStage: c.growth_stage || '',
    waterRequirement: c.water_requirement || '',
    fertilizerSchedule: c.fertilizer_schedule || '',
    pesticideSchedule: c.pesticide_schedule || '',
    expectedYieldKg: Number(c.expected_yield_kg),
    actualYieldKg: Number(c.actual_yield_kg),
    costOfCultivation: Number(c.cost_of_cultivation),
    revenue: Number(c.revenue),
  }))
}

export async function getAreas(): Promise<PlantationArea[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.from('plantation_areas').select('*').order('id')
  if (error || !data) return []
  return data.map((a) => ({
    id: a.id,
    name: a.name,
    sizeAcres: Number(a.size_acres),
    gpsLocation: a.gps_location || undefined,
    cropId: a.crop_id || '',
    variety: a.variety || '',
    plantCount: a.plant_count,
    plantingDate: a.planting_date,
    expectedHarvestDate: a.expected_harvest_date,
    growthStage: a.growth_stage || '',
    healthStatus: a.health_status,
    aiHealthScore: a.ai_health_score,
    lastInspection: a.last_inspection,
    assignedStaff: a.assigned_staff || [],
    irrigationMethod: a.irrigation_method || '',
    fertilizerSchedule: a.fertilizer_schedule || '',
    diseaseStatus: a.disease_status || '',
    pestStatus: a.pest_status || '',
    mapX: Number(a.map_x), mapY: Number(a.map_y), mapWidth: Number(a.map_width), mapHeight: Number(a.map_height),
  }))
}

export async function getFacilities(): Promise<FacilityPoint[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.from('facilities').select('*').order('id')
  if (error || !data) return []
  return data.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    description: f.description || '',
    mapX: Number(f.map_x), mapY: Number(f.map_y), mapWidth: Number(f.map_width), mapHeight: Number(f.map_height),
  }))
}

export async function getGreenhouses(): Promise<GreenhousePlot[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.from('greenhouses').select('*').order('id')
  if (error || !data) return []
  return data.map((g) => ({
    id: g.id,
    tunnel: g.tunnel,
    cropName: g.crop_name,
    sqft: Number(g.sqft),
    plantingDate: g.planting_date,
    firstHarvestDate: g.first_harvest_date,
    harvestedQtyRange: g.harvested_qty_range || '',
    revenue: Number(g.revenue),
    expenses: g.expenses || [],
    totalExpenses: Number(g.total_expenses),
    dateOfCropRemoval: g.date_of_crop_removal,
    nextCropPlantingDate: g.next_crop_planting_date,
  }))
}

export async function getCropPlan(): Promise<CropPlanRecord[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.from('crop_plan').select('*').order('id')
  if (error || !data) return []
  return data.map((c) => ({
    id: c.id,
    cropName: c.crop_name,
    sqft: c.sqft ? Number(c.sqft) : undefined,
    plantingDate: c.planting_date || undefined,
    extendedDate: c.extended_date || undefined,
    harvestedQty: c.harvested_qty || undefined,
    revenue: c.revenue ? Number(c.revenue) : undefined,
    dateOfCropRemoval: c.date_of_crop_removal || undefined,
    nextCropPlantingDate: c.next_crop_planting_date || undefined,
    note: c.note || undefined,
  }))
}

export function totalGreenhouseRevenue(greenhouses: GreenhousePlot[]) {
  return greenhouses.reduce((s, g) => s + g.revenue, 0)
}
export function totalGreenhouseExpenses(greenhouses: GreenhousePlot[]) {
  return greenhouses.reduce((s, g) => s + g.totalExpenses, 0)
}
