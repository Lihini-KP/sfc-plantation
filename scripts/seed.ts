// Seeds Supabase with the REAL data already validated in the running app:
// finance, crop sales, the Annual Crop Plan, greenhouse tunnels, the
// Hibiscus harvest ledger, real worker names, and the physical estate
// layout (areas/facilities/crops). Deliberately does NOT seed the
// fabricated/illustrative content (AI analyses, sample notifications, sample
// daily updates, sample tasks, sample inventory) - those stay empty in a
// fresh database so nothing fake is presented as real. Add real records for
// those tables once you have them.
//
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts

import { createClient } from '@supabase/supabase-js'
import { areas } from '../lib/mock-data/areas'
import { facilities } from '../lib/mock-data/facilities'
import { crops } from '../lib/mock-data/crops'
import { greenhouses } from '../lib/mock-data/greenhouses'
import { cropPlan } from '../lib/mock-data/cropPlan'
import { monthlyFinance, recentMonthlyDetail, bankFund } from '../lib/mock-data/finance'
import { cropSales } from '../lib/mock-data/cropSales'
import { hibiscusHarvestLog } from '../lib/mock-data/hibiscusHarvestLog'
import { users } from '../lib/mock-data/users'
import { chickenFarmStatus } from '../lib/mock-data/chicken'
import { ESTATE_LOCATION } from '../lib/estate-config'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables first.')
  process.exit(1)
}
const supabase = createClient(url, serviceKey)

async function run() {
  console.log('Seeding real data into Supabase...')

  await supabase.from('estate_location').upsert({
    id: 1, label: ESTATE_LOCATION.label, latitude: ESTATE_LOCATION.latitude,
    longitude: ESTATE_LOCATION.longitude, confirmed: ESTATE_LOCATION.confirmed,
  })

  await supabase.from('chicken_farm_status').upsert({
    id: 1, operational: chickenFarmStatus.operational, planned_start_month: chickenFarmStatus.plannedStartMonth,
    planned_start_date: chickenFarmStatus.plannedStartDate, note: chickenFarmStatus.note,
  })

  await supabase.from('app_users').upsert(
    users.map((u) => ({ name: u.name, role: u.role, avatar_initials: u.avatarInitials }))
  )

  await supabase.from('crops').upsert(
    crops.map((c) => ({
      id: c.id, name: c.name, variety: c.variety, plant_count: c.plantCount, planting_date: c.plantingDate,
      expected_harvest_date: c.expectedHarvestDate, harvest_cycle_days: c.harvestCycleDays, growth_stage: c.growthStage,
      water_requirement: c.waterRequirement, fertilizer_schedule: c.fertilizerSchedule, pesticide_schedule: c.pesticideSchedule,
      expected_yield_kg: c.expectedYieldKg, actual_yield_kg: c.actualYieldKg, cost_of_cultivation: c.costOfCultivation, revenue: c.revenue,
    }))
  )

  await supabase.from('plantation_areas').upsert(
    areas.map((a) => ({
      id: a.id, name: a.name, size_acres: a.sizeAcres, gps_location: a.gpsLocation, crop_id: a.cropId, variety: a.variety,
      plant_count: a.plantCount, planting_date: a.plantingDate, expected_harvest_date: a.expectedHarvestDate,
      growth_stage: a.growthStage, health_status: a.healthStatus, ai_health_score: a.aiHealthScore, last_inspection: a.lastInspection,
      assigned_staff: a.assignedStaff, irrigation_method: a.irrigationMethod, fertilizer_schedule: a.fertilizerSchedule,
      disease_status: a.diseaseStatus, pest_status: a.pestStatus, map_x: a.mapX, map_y: a.mapY, map_width: a.mapWidth, map_height: a.mapHeight,
    }))
  )

  await supabase.from('facilities').upsert(
    facilities.map((f) => ({
      id: f.id, name: f.name, category: f.category, description: f.description,
      map_x: f.mapX, map_y: f.mapY, map_width: f.mapWidth, map_height: f.mapHeight,
    }))
  )

  await supabase.from('greenhouses').upsert(
    greenhouses.map((g) => ({
      id: g.id, tunnel: g.tunnel, crop_name: g.cropName, sqft: g.sqft, planting_date: g.plantingDate,
      first_harvest_date: g.firstHarvestDate, harvested_qty_range: g.harvestedQtyRange, revenue: g.revenue,
      expenses: g.expenses, total_expenses: g.totalExpenses, date_of_crop_removal: g.dateOfCropRemoval,
      next_crop_planting_date: g.nextCropPlantingDate,
    }))
  )

  await supabase.from('crop_plan').upsert(
    cropPlan.map((c) => ({
      id: c.id, crop_name: c.cropName, sqft: c.sqft, planting_date: c.plantingDate, extended_date: c.extendedDate,
      harvested_qty: c.harvestedQty, revenue: c.revenue, date_of_crop_removal: c.dateOfCropRemoval,
      next_crop_planting_date: c.nextCropPlantingDate, note: c.note,
    }))
  )

  await supabase.from('monthly_finance').upsert(monthlyFinance.map((m) => ({ month: m.month, expenses: m.expenses, income: m.income })))
  await supabase.from('recent_monthly_detail').upsert(
    recentMonthlyDetail.map((m) => ({ month: m.month, total_expenses: m.totalExpenses, total_income: m.totalIncome, profit_loss: m.profitLoss, expense_note: m.expenseNote }))
  )
  await supabase.from('bank_fund').upsert({ id: 1, amount: bankFund.amount, as_of: bankFund.asOf })
  await supabase.from('crop_sales').upsert(
    cropSales.map((c) => ({ month: c.month, crop_name: c.cropName, quantity: c.quantity, income_rs: c.incomeRs }))
  )
  await supabase.from('harvest_log').upsert(
    hibiscusHarvestLog.map((h) => ({ crop_name: 'Hibiscus', date: h.date, quantity_kg: h.quantityKg, confidence: h.confidence, source: "Richard's handwritten ledger" }))
  )

  console.log('Done. Fabricated/illustrative tables (ai_analyses, notifications, daily_updates, plantation_tasks, inventory_items, chicken_*) were left empty on purpose.')
}

run()
