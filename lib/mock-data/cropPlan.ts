// Transcribed directly from the estate's "ANNUAL CROP PLAN" Google Sheet
// (tab "Sheet2"). This is the real planting/harvest cycle record per crop -
// separate from, and not always consistent with, the P&L Cultivation
// sheet's monthly retail sales figures (that sheet tracks small ongoing
// retail sales; this one tracks full harvest-cycle totals and dates).
export interface CropPlanRecord {
  id: string
  cropName: string
  sqft?: number
  plantingDate?: string
  extendedDate?: string
  harvestedQty?: string
  revenue?: number
  dateOfCropRemoval?: string
  nextCropPlantingDate?: string
  note?: string
}

export const cropPlan: CropPlanRecord[] = [
  { id: 'cp-1', cropName: 'Hot Dragon', sqft: 2200, plantingDate: '2025-09-24', extendedDate: '2025-12-15', harvestedQty: '1200 kg', revenue: 600000, dateOfCropRemoval: '2026-10-31', nextCropPlantingDate: '2026-12-01' },
  { id: 'cp-2', cropName: 'Hot Dragon', sqft: 3200, plantingDate: '2024-12-13', extendedDate: '2025-03-15', harvestedQty: '1908.51 kg', revenue: 1640413, dateOfCropRemoval: '2025-12-31', nextCropPlantingDate: '2026-01-31' },
  { id: 'cp-3', cropName: 'Hot Dragon', sqft: 3200, plantingDate: '2025-08-18', extendedDate: '2025-10-13', harvestedQty: '1872 kg', revenue: 936000, dateOfCropRemoval: '2026-09-01', nextCropPlantingDate: '2026-11-01' },
  { id: 'cp-4', cropName: 'Muriya', sqft: 1050, plantingDate: '2025-07-23', extendedDate: '2025-09-16', harvestedQty: '575 kg', revenue: 172500, dateOfCropRemoval: '2026-01-31', nextCropPlantingDate: '2026-03-01' },
  { id: 'cp-5', cropName: 'Muriya', sqft: 3200, plantingDate: '2025-07-19', extendedDate: '2025-09-16', harvestedQty: '1875 kg', revenue: 562500, dateOfCropRemoval: '2026-02-15', nextCropPlantingDate: '2026-04-02' },
  { id: 'cp-6', cropName: 'Papaya', plantingDate: '2024-10-16', extendedDate: '2025-08-20', harvestedQty: '3100 kg', revenue: 124000, dateOfCropRemoval: '2026-10-26', nextCropPlantingDate: '2026-11-30' },
  { id: 'cp-7', cropName: 'Banana', plantingDate: '2025-11-20', extendedDate: '2026-09-20', harvestedQty: '7500 kg (projected)', revenue: 1125000, dateOfCropRemoval: '2028-09-30', nextCropPlantingDate: '2030-10-30' },
  { id: 'cp-8', cropName: 'Passion Fruit', plantingDate: '2024-02-13', extendedDate: '2025-10-08', harvestedQty: '2590 kg', revenue: 569800, dateOfCropRemoval: '2026-02-20', nextCropPlantingDate: '2026-03-25' },
  { id: 'cp-9', cropName: 'Turmeric', plantingDate: '2025-09-08', extendedDate: '2026-06-18', harvestedQty: '80 kg', revenue: 160000, dateOfCropRemoval: '2026-06-18', nextCropPlantingDate: '2026-07-25' },
  { id: 'cp-10', cropName: 'Moringa', plantingDate: '2024-02-02', extendedDate: '2025-10-08', note: 'Leaf harvest - ongoing for the next 10 years (perennial)' },
  { id: 'cp-11', cropName: 'Mango', plantingDate: '2025-05-20', extendedDate: '2032-10-20', note: 'First fruiting not expected until 2032 - then 250-300 fruits per plant per season' },
  { id: 'cp-12', cropName: 'Pomegranate', plantingDate: '2025-11-20', note: 'Recently planted - no harvest data yet' },
  { id: 'cp-13', cropName: 'Gurmar', plantingDate: '2022-01-01', harvestedQty: '120 kg/year', revenue: 780000, note: 'Ongoing perennial - planted 2022, figures are per-year' },
  { id: 'cp-14', cropName: 'Hibiscus', plantingDate: '2022-01-01', harvestedQty: '60 kg/year', revenue: 210000, note: 'Ongoing perennial - planted 2022, figures are per-year' },
  { id: 'cp-15', cropName: 'King Coconut', plantingDate: '2025-12-10', extendedDate: '2029-12-10', note: 'Border/perimeter planting - first harvest not expected until ~2029' },
  { id: 'cp-16', cropName: 'Cucumber', sqft: 0.25, plantingDate: '2025-12-04', extendedDate: '2026-01-10', harvestedQty: '1000 kg', revenue: 60000, dateOfCropRemoval: '2026-02-20', nextCropPlantingDate: '2026-03-01' },
  { id: 'cp-17', cropName: 'Kakiri', sqft: 0.25, plantingDate: '2025-12-19', extendedDate: '2026-02-08', harvestedQty: '1000 kg', revenue: 50000, dateOfCropRemoval: '2026-03-31' },
]

export function getCropPlanByName(name: string) {
  const key = name.toLowerCase().split(' ')[0]
  return cropPlan.filter((c) => c.cropName.toLowerCase().includes(key))
}
