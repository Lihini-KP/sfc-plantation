// Transcribed directly from the estate's "ANNUAL CROP PLAN" Google Sheet,
// tab "Crop Plan new". These are the 5 named greenhouse tunnels - the only
// place in the source data where a full expense breakdown exists, so this
// is the first place in the app with a fully real (not estimated) profit
// figure.
export interface GreenhousePlot {
  id: string
  tunnel: string
  cropName: string
  sqft: number
  plantingDate: string
  firstHarvestDate: string
  harvestedQtyRange: string
  revenue: number
  expenses: { label: string; amount: number }[]
  totalExpenses: number
  dateOfCropRemoval: string
  nextCropPlantingDate: string
}

export const greenhouses: GreenhousePlot[] = [
  {
    id: 'gh-alpha',
    tunnel: 'Alpha',
    cropName: 'Muriya',
    sqft: 3200,
    plantingDate: '2026-06-10',
    firstHarvestDate: '2026-09-01',
    harvestedQtyRange: '800kg - 900kg',
    revenue: 240000,
    expenses: [
      { label: 'Plants', amount: 10000 },
      { label: 'Grow Bags', amount: 106000 },
      { label: 'Fertilizer', amount: 320000 },
      { label: 'Transport', amount: 20000 },
    ],
    totalExpenses: 456000,
    dateOfCropRemoval: '2026-11-01',
    nextCropPlantingDate: '2026-11-30',
  },
  {
    id: 'gh-bravo',
    tunnel: 'Bravo',
    cropName: 'Hot Dragon',
    sqft: 3200,
    plantingDate: '2026-07-01',
    firstHarvestDate: '2026-10-01',
    harvestedQtyRange: '1000kg - 1200kg',
    revenue: 500000,
    expenses: [
      { label: 'Plants', amount: 16000 },
      { label: 'Grow Bags', amount: 106000 },
      { label: 'Fertilizer', amount: 320000 },
      { label: 'Transport', amount: 20000 },
    ],
    totalExpenses: 462000,
    dateOfCropRemoval: '2027-05-01',
    nextCropPlantingDate: '2027-05-30',
  },
  {
    id: 'gh-charlie',
    tunnel: 'Charlie',
    cropName: 'Hot Dragon',
    sqft: 3200,
    plantingDate: '2026-01-23',
    firstHarvestDate: '2026-04-20',
    harvestedQtyRange: '800kg - 900kg',
    revenue: 270000,
    expenses: [
      { label: 'Seeds', amount: 9375 },
      { label: 'Grow Bags', amount: 7000 },
      { label: 'Fertilizer', amount: 350000 },
      { label: 'Transport', amount: 20000 },
    ],
    totalExpenses: 386375,
    dateOfCropRemoval: '2026-10-01',
    nextCropPlantingDate: '2026-11-01',
  },
  {
    id: 'gh-oregano',
    tunnel: 'Oregano',
    cropName: 'Hot Dragon',
    sqft: 2200,
    plantingDate: '2025-09-24',
    firstHarvestDate: '2025-12-15',
    harvestedQtyRange: '1000kg - 1200kg',
    revenue: 400000,
    expenses: [
      { label: 'Plants', amount: 12000 },
      { label: 'Fertilizer', amount: 320000 },
      { label: 'Transport', amount: 20000 },
    ],
    totalExpenses: 352000,
    dateOfCropRemoval: '2026-12-01',
    nextCropPlantingDate: '2027-01-01',
  },
  {
    id: 'gh-echo',
    tunnel: 'Echo',
    cropName: 'Muriya',
    sqft: 1050,
    plantingDate: '2026-04-08',
    firstHarvestDate: '2026-06-25',
    harvestedQtyRange: '500kg - 600kg',
    revenue: 200000,
    expenses: [
      { label: 'Plants', amount: 6250 },
      { label: 'Grow Bags', amount: 78000 },
      { label: 'Fertilizer', amount: 320000 },
      { label: 'Transport', amount: 20000 },
    ],
    totalExpenses: 424250,
    dateOfCropRemoval: '2026-09-01',
    nextCropPlantingDate: '2026-10-01',
  },
]

export function totalGreenhouseRevenue() {
  return greenhouses.reduce((s, g) => s + g.revenue, 0)
}
export function totalGreenhouseExpenses() {
  return greenhouses.reduce((s, g) => s + g.totalExpenses, 0)
}
