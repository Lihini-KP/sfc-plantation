// Real data transcribed from HARTI's (Hector Kobbekaduwa Agrarian Research and
// Training Institute) official "Food Information Bulletin" - the monthly
// national food commodities bulletin referenced on their Market Information
// page. Source PDF fetched directly from harti.gov.lk.
//
// IMPORTANT: September 2024 (Vol. 17, No. 09) is the most recent edition
// HARTI has published on their site - there is no 2025 or 2026 bulletin yet.
// This data is real but not current; treat trends as the latest available
// national reference point, not live market pricing.
//
// HARTI's bulletin only tracks national staple commodities (rice, vegetables,
// fruits, chillies/onions, fish/meat/egg, potato/pulses, wheat/sugar). Most of
// our specialty/medicinal crops have no HARTI market reference at all - see
// UNTRACKED_CROPS below. Only fabricate nothing: crops not in
// HARTI_CROP_MARKET simply have no market comparison data.

export const HARTI_BULLETIN_META = {
  title: 'Food Information Bulletin',
  volume: 17,
  issueNumber: 9,
  month: 'September',
  year: 2024,
  publisher: 'Food Systems and Data Management Division, Hector Kobbekaduwa Agrarian Research and Training Institute (HARTI)',
  sourceUrl: 'https://www.harti.gov.lk/index.php/en/market-information/monthly-food-commodities-bulletin',
  pdfUrl: 'https://harti.gov.lk/assets/pdf/food_price/monthly/eng/2024/September_2024.pdf',
  note: 'This is the latest Monthly Food Commodities Bulletin HARTI has published as of now - no 2025/2026 edition exists on their site yet.',
}

export interface HartiCropMarketEntry {
  id: string
  hartiCommodityName: string
  matchedCrop: string
  priceBasis: 'Wholesale' | 'Retail'
  priceRangeRs: string
  avgPriceRs: number
  changeVsPrevMonthPct: number
  changeVsSameMonthLastYearPct: number
  narrative: string
}

export const hartiCropMarket: HartiCropMarketEntry[] = [
  {
    id: 'harti-green-chilli-wholesale',
    hartiCommodityName: 'Green Chillies',
    matchedCrop: 'Muriya (Chili)',
    priceBasis: 'Wholesale',
    priceRangeRs: '80.00 - 300.00',
    avgPriceRs: 170.60,
    changeVsPrevMonthPct: -33.62,
    changeVsSameMonthLastYearPct: -61.04,
    narrative: 'Supply from major producing areas increased early in the month, pulling both wholesale and retail green chili prices down sharply from August.',
  },
  {
    id: 'harti-dried-chilli-wholesale',
    hartiCommodityName: 'Dried Chillies (imported)',
    matchedCrop: 'Muriya (Chili)',
    priceBasis: 'Wholesale',
    priceRangeRs: '650.00 - 800.00',
    avgPriceRs: 702.81,
    changeVsPrevMonthPct: -5.86,
    changeVsSameMonthLastYearPct: -31.27,
    narrative: 'Imports rose to 2,854 mt for the month; CIF price eased slightly, and wholesale/retail prices continued a year-on-year decline.',
  },
  {
    id: 'harti-banana-kolikuttu-wholesale',
    hartiCommodityName: 'Banana - Kolikuttu',
    matchedCrop: 'Banana (Kolikuttu)',
    priceBasis: 'Wholesale',
    priceRangeRs: '300.00 - 500.00',
    avgPriceRs: 453.31,
    changeVsPrevMonthPct: 22.68,
    changeVsSameMonthLastYearPct: -16.39,
    narrative: 'Kolikuttu was the one banana variety to buck the seasonal trend, rising sharply on a low stock position while other varieties eased.',
  },
  {
    id: 'harti-banana-kolikuttu-retail',
    hartiCommodityName: 'Banana - Kolikuttu',
    matchedCrop: 'Banana (Kolikuttu)',
    priceBasis: 'Retail',
    priceRangeRs: '400.00 - 650.00',
    avgPriceRs: 547.33,
    changeVsPrevMonthPct: 7.97,
    changeVsSameMonthLastYearPct: -14.20,
    narrative: 'Retail followed wholesale upward, though the increase was smaller than at the wholesale level.',
  },
  {
    id: 'harti-mango-karthakolomban-wholesale',
    hartiCommodityName: 'Mango - Karthakolomban',
    matchedCrop: 'Mango (Karutha Colomban)',
    priceBasis: 'Wholesale',
    priceRangeRs: '167.00 - 350.00',
    avgPriceRs: 286.72,
    changeVsPrevMonthPct: -5.54,
    changeVsSameMonthLastYearPct: -5.99,
    narrative: 'Only karthakolomban and vilad varieties were available this month; karthakolomban softened on lower-quality stock reaching the market.',
  },
  {
    id: 'harti-mango-karthakolomban-retail',
    hartiCommodityName: 'Mango - Karthakolomban',
    matchedCrop: 'Mango (Karutha Colomban)',
    priceBasis: 'Retail',
    priceRangeRs: '300.00 - 400.00',
    avgPriceRs: 328.00,
    changeVsPrevMonthPct: -31.60,
    changeVsSameMonthLastYearPct: -8.65,
    narrative: 'Retail karthakolomban prices dropped more sharply than wholesale, a larger correction than the previous month.',
  },
  {
    id: 'harti-papaw-wholesale',
    hartiCommodityName: 'Papaw (Papaya)',
    matchedCrop: 'Papaya',
    priceBasis: 'Wholesale',
    priceRangeRs: '120.00 - 300.00',
    avgPriceRs: 219.27,
    changeVsPrevMonthPct: 61.18,
    changeVsSameMonthLastYearPct: 59.27,
    narrative: 'Papaw wholesale prices jumped sharply month-on-month and remain well above year-ago levels; Sri Lanka exported 1,301 mt of fresh papaw this month, 97% of all fresh fruit exports.',
  },
  {
    id: 'harti-papaw-retail',
    hartiCommodityName: 'Papaw (Papaya)',
    matchedCrop: 'Papaya',
    priceBasis: 'Retail',
    priceRangeRs: '180.00 - 400.00',
    avgPriceRs: 303.10,
    changeVsPrevMonthPct: 27.61,
    changeVsSameMonthLastYearPct: 30.49,
    narrative: 'Retail papaw rose in step with wholesale, continuing a strong upward trend versus last year.',
  },
  {
    id: 'harti-passion-fruit-wholesale',
    hartiCommodityName: 'Passion Fruit',
    matchedCrop: 'Passion Fruit',
    priceBasis: 'Wholesale',
    priceRangeRs: '45.00 - 65.00',
    avgPriceRs: 58.97,
    changeVsPrevMonthPct: 21.84,
    changeVsSameMonthLastYearPct: 95.67,
    narrative: 'Passion fruit posted the largest year-on-year increase of any fruit tracked this month, nearly doubling versus September last year, on limited supply.',
  },
  {
    id: 'harti-passion-fruit-retail',
    hartiCommodityName: 'Passion Fruit',
    matchedCrop: 'Passion Fruit',
    priceBasis: 'Retail',
    priceRangeRs: '60.00 - 100.00',
    avgPriceRs: 82.42,
    changeVsPrevMonthPct: 8.62,
    changeVsSameMonthLastYearPct: 55.63,
    narrative: 'Retail passion fruit prices climbed more moderately than wholesale but are still up over 55% year-on-year.',
  },
]

// Our crops/tunnels with no HARTI Food Information Bulletin coverage at all -
// these are medicinal/specialty crops HARTI does not track nationally.
export const HARTI_UNTRACKED_CROPS = [
  'Gurmar', 'Hibiscus', 'Moringa', 'Turmeric', 'Roses', 'Mushroom',
  'Soursop & Ginger', 'Hot Dragon (Dragon Fruit)', 'Cucumber', 'Kakiri',
]

export function getMarketEntriesForCrop(cropKeyword: string) {
  const kw = cropKeyword.toLowerCase()
  return hartiCropMarket.filter((m) => m.matchedCrop.toLowerCase().includes(kw) || m.hartiCommodityName.toLowerCase().includes(kw))
}
