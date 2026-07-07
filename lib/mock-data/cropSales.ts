// Real monthly crop income, transcribed directly from the estate's
// "P&L Cultivation" Google Sheet (Jan-May 2026 detail tabs). Quantity is
// kept as written in the source (units were inconsistent - kg vs g vs
// bundle counts like "miti") rather than guessed/normalized.
export interface CropSaleRecord {
  id: string
  month: string
  cropName: string
  quantity: string
  incomeRs: number
}

export const cropSales: CropSaleRecord[] = [
  // Jan 2026
  { id: 'cs-jan-1', month: 'Jan 2026', cropName: 'Naimiris (Chili)', quantity: '71.805 kg', incomeRs: 76088.50 },
  { id: 'cs-jan-2', month: 'Jan 2026', cropName: 'Capsicum', quantity: '29.3 kg', incomeRs: 12099.50 },
  { id: 'cs-jan-3', month: 'Jan 2026', cropName: 'Papaya', quantity: '2.452 kg', incomeRs: 2452.00 },
  { id: 'cs-jan-4', month: 'Jan 2026', cropName: 'Passion Fruit', quantity: '800 g', incomeRs: 200.00 },
  { id: 'cs-jan-5', month: 'Jan 2026', cropName: 'Gurmar', quantity: '2.742 kg', incomeRs: 12769.30 },
  { id: 'cs-jan-6', month: 'Jan 2026', cropName: 'Hibiscus', quantity: '2.5 kg', incomeRs: 10000.00 },
  { id: 'cs-jan-7', month: 'Jan 2026', cropName: 'Cucumber', quantity: '275.33 kg', incomeRs: 18369.50 },
  { id: 'cs-jan-8', month: 'Jan 2026', cropName: 'Thebu', quantity: '156.25 kg', incomeRs: 10937.50 },
  { id: 'cs-jan-9', month: 'Jan 2026', cropName: 'Gotukola', quantity: '11.5 kg', incomeRs: 1125.00 },
  { id: 'cs-jan-10', month: 'Jan 2026', cropName: 'Nivithi', quantity: '1.3 kg', incomeRs: 104.00 },
  { id: 'cs-jan-11', month: 'Jan 2026', cropName: 'Tantin', quantity: '1.75 kg', incomeRs: 140.00 },
  { id: 'cs-jan-12', month: 'Jan 2026', cropName: 'Salad Cucumber', quantity: '1 kg', incomeRs: 140.00 },

  // Feb 2026
  { id: 'cs-feb-1', month: 'Feb 2026', cropName: 'Naimiris (Chili)', quantity: '136.09 kg', incomeRs: 104045.00 },
  { id: 'cs-feb-2', month: 'Feb 2026', cropName: 'Capsicum', quantity: '8.45 kg', incomeRs: 3626.00 },
  { id: 'cs-feb-3', month: 'Feb 2026', cropName: 'Papaya', quantity: '6.24 kg', incomeRs: 624.00 },
  { id: 'cs-feb-4', month: 'Feb 2026', cropName: 'Salad Cucumber', quantity: '680.5 kg', incomeRs: 81927.50 },
  { id: 'cs-feb-5', month: 'Feb 2026', cropName: 'Gurmar', quantity: '1.7 kg', incomeRs: 11050.00 },
  { id: 'cs-feb-6', month: 'Feb 2026', cropName: 'Hibiscus', quantity: '2.55 kg', incomeRs: 11775.00 },
  { id: 'cs-feb-7', month: 'Feb 2026', cropName: 'Cucumber', quantity: '1 kg', incomeRs: 30.00 },
  { id: 'cs-feb-8', month: 'Feb 2026', cropName: 'Cooking Melon', quantity: '2.5 kg', incomeRs: 175.00 },
  { id: 'cs-feb-9', month: 'Feb 2026', cropName: 'Turmeric', quantity: '1.25 kg', incomeRs: 375.00 },
  { id: 'cs-feb-10', month: 'Feb 2026', cropName: 'Tantin', quantity: '5.6 kg', incomeRs: 560.00 },

  // Mar 2026
  { id: 'cs-mar-1', month: 'Mar 2026', cropName: 'Naimiris (Chili)', quantity: '115.45 kg', incomeRs: 61182.00 },
  { id: 'cs-mar-2', month: 'Mar 2026', cropName: 'Salad Cucumber', quantity: '611.65 kg', incomeRs: 71803.00 },
  { id: 'cs-mar-3', month: 'Mar 2026', cropName: 'Capsicum', quantity: '5.05 kg', incomeRs: 3340.00 },
  { id: 'cs-mar-4', month: 'Mar 2026', cropName: 'Hibiscus', quantity: '1.8 kg', incomeRs: 8100.00 },
  { id: 'cs-mar-5', month: 'Mar 2026', cropName: 'Papaya', quantity: '55.07 kg', incomeRs: 6702.00 },
  { id: 'cs-mar-6', month: 'Mar 2026', cropName: 'Gurmar', quantity: '1 kg', incomeRs: 6500.00 },
  { id: 'cs-mar-7', month: 'Mar 2026', cropName: 'Neem Leaves', quantity: '33 kg', incomeRs: 2640.00 },
  { id: 'cs-mar-8', month: 'Mar 2026', cropName: 'Turmeric', quantity: '63 kg', incomeRs: 15750.00 },
  { id: 'cs-mar-9', month: 'Mar 2026', cropName: 'Thebu', quantity: '44 kg', incomeRs: 4400.00 },
  { id: 'cs-mar-10', month: 'Mar 2026', cropName: 'Aloe Vera', quantity: '44.3 kg', incomeRs: 4430.00 },
  { id: 'cs-mar-11', month: 'Mar 2026', cropName: 'Tomato', quantity: '10.5 kg', incomeRs: 1055.00 },
  { id: 'cs-mar-12', month: 'Mar 2026', cropName: 'Cabbage', quantity: '14 miti (bundles)', incomeRs: 700.00 },
  { id: 'cs-mar-13', month: 'Mar 2026', cropName: 'Nocoal', quantity: '2.9 kg', incomeRs: 290.00 },
  { id: 'cs-mar-14', month: 'Mar 2026', cropName: 'Tantin', quantity: '1.5 kg', incomeRs: 150.00 },
  { id: 'cs-mar-15', month: 'Mar 2026', cropName: 'Cooking Melon', quantity: '3.9 kg', incomeRs: 195.00 },
  { id: 'cs-mar-16', month: 'Mar 2026', cropName: 'Naran (Lime)', quantity: '2.5 kg', incomeRs: 250.00 },
  { id: 'cs-mar-17', month: 'Mar 2026', cropName: 'Green Chili', quantity: '2.7 kg', incomeRs: 540.00 },

  // Apr 2026
  { id: 'cs-apr-1', month: 'Apr 2026', cropName: 'Naimiris (Chili)', quantity: '106.5 kg', incomeRs: 25636.25 },
  { id: 'cs-apr-2', month: 'Apr 2026', cropName: 'Papaya', quantity: '22.47 kg', incomeRs: 2247.00 },
  { id: 'cs-apr-3', month: 'Apr 2026', cropName: 'Salad Cucumber', quantity: '109 kg', incomeRs: 10911.00 },
  { id: 'cs-apr-4', month: 'Apr 2026', cropName: 'Gurmar', quantity: '1.2 kg', incomeRs: 2040.00 },
  { id: 'cs-apr-5', month: 'Apr 2026', cropName: 'Green Chili', quantity: '1.58 kg', incomeRs: 226.00 },
  { id: 'cs-apr-6', month: 'Apr 2026', cropName: 'Naran (Lime)', quantity: '1.5 kg', incomeRs: 150.00 },
  { id: 'cs-apr-7', month: 'Apr 2026', cropName: 'Hibiscus', quantity: '5 kg', incomeRs: 22500.00 },
  { id: 'cs-apr-8', month: 'Apr 2026', cropName: 'Dried Chili', quantity: '1 kg', incomeRs: 900.00 },
  { id: 'cs-apr-9', month: 'Apr 2026', cropName: 'Banana', quantity: '8.65 kg', incomeRs: 1730.00 },
  { id: 'cs-apr-10', month: 'Apr 2026', cropName: 'Walpenala', quantity: '11 kg', incomeRs: 1100.00 },
  { id: 'cs-apr-11', month: 'Apr 2026', cropName: 'Beetroot', quantity: '2.5 kg', incomeRs: 150.00 },
  { id: 'cs-apr-12', month: 'Apr 2026', cropName: 'Cauliflower', quantity: '150 g', incomeRs: 30.00 },
  { id: 'cs-apr-13', month: 'Apr 2026', cropName: 'Cooking Melon', quantity: '850 g', incomeRs: 43.00 },

  // May 2026
  { id: 'cs-may-1', month: 'May 2026', cropName: 'Naimiris (Chili)', quantity: '42.55 kg', incomeRs: 10615.00 },
  { id: 'cs-may-2', month: 'May 2026', cropName: 'Papaya', quantity: '91.98 kg', incomeRs: 4598.00 },
  { id: 'cs-may-3', month: 'May 2026', cropName: 'Passion Fruit', quantity: '32.5 kg', incomeRs: 12040.00 },
  { id: 'cs-may-4', month: 'May 2026', cropName: 'Gurmar', quantity: '2.4 kg', incomeRs: 15600.00 },
  { id: 'cs-may-5', month: 'May 2026', cropName: 'Green Chili', quantity: '5.52 kg', incomeRs: 998.00 },
  { id: 'cs-may-6', month: 'May 2026', cropName: 'Curry Leaves', quantity: '2 kg', incomeRs: 40.00 },
  { id: 'cs-may-7', month: 'May 2026', cropName: 'Hibiscus', quantity: '1.05 kg', incomeRs: 4518.00 },
  { id: 'cs-may-8', month: 'May 2026', cropName: 'Banana', quantity: '4.05 kg', incomeRs: 810.00 },
]

export function totalIncomeByCrop() {
  const map = new Map<string, number>()
  for (const r of cropSales) map.set(r.cropName, (map.get(r.cropName) || 0) + r.incomeRs)
  return [...map.entries()].map(([cropName, incomeRs]) => ({ cropName, incomeRs })).sort((a, b) => b.incomeRs - a.incomeRs)
}
