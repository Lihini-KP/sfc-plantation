// Transcribed directly from Richard's handwritten Hibiscus harvest weighing
// ledger (4 photographed pages, Apr-Jul 2026). Dates and kg weights are
// legible; two Sinhala-text columns in the ledger (likely collector name and
// grade/type) were not transcribed - handwriting wasn't confident enough to
// read reliably, pending confirmation from the estate.
// `confidence: 'low'` marks weights where the handwriting was ambiguous
// (stylized decimals) - worth spot-checking against the physical ledger.
export interface HibiscusHarvestEntry {
  id: string
  date: string
  quantityKg: number
  confidence: 'high' | 'low'
}

export const hibiscusHarvestLog: HibiscusHarvestEntry[] = [
  // Page: Apr 6 - May 5, 2026
  { id: 'hh-1', date: '2026-04-06', quantityKg: 4.000, confidence: 'high' },
  { id: 'hh-2', date: '2026-04-16', quantityKg: 2.120, confidence: 'high' },
  { id: 'hh-3', date: '2026-04-17', quantityKg: 1.800, confidence: 'high' },
  { id: 'hh-4', date: '2026-04-18', quantityKg: 1.320, confidence: 'high' },
  { id: 'hh-5', date: '2026-04-20', quantityKg: 1.420, confidence: 'high' },
  { id: 'hh-6', date: '2026-04-21', quantityKg: 1.740, confidence: 'high' },
  { id: 'hh-7', date: '2026-04-25', quantityKg: 1.300, confidence: 'high' },
  { id: 'hh-8', date: '2026-04-27', quantityKg: 2.300, confidence: 'high' },
  { id: 'hh-9', date: '2026-04-28', quantityKg: 1.800, confidence: 'high' },
  { id: 'hh-10', date: '2026-04-28', quantityKg: 1.220, confidence: 'high' },
  { id: 'hh-11', date: '2026-04-30', quantityKg: 1.365, confidence: 'high' },
  { id: 'hh-12', date: '2026-05-02', quantityKg: 1.450, confidence: 'high' },
  { id: 'hh-13', date: '2026-05-04', quantityKg: 2.120, confidence: 'high' },
  { id: 'hh-14', date: '2026-05-04', quantityKg: 0.800, confidence: 'high' },
  { id: 'hh-15', date: '2026-05-05', quantityKg: 2.100, confidence: 'high' },
  // Page: May 7 - May 25, 2026
  { id: 'hh-16', date: '2026-05-07', quantityKg: 3.800, confidence: 'high' },
  { id: 'hh-17', date: '2026-05-08', quantityKg: 2.620, confidence: 'high' },
  { id: 'hh-18', date: '2026-05-09', quantityKg: 1.430, confidence: 'high' },
  { id: 'hh-19', date: '2026-05-11', quantityKg: 3.260, confidence: 'high' },
  { id: 'hh-20', date: '2026-05-12', quantityKg: 1.490, confidence: 'high' },
  { id: 'hh-21', date: '2026-05-13', quantityKg: 1.800, confidence: 'high' },
  { id: 'hh-22', date: '2026-05-13', quantityKg: 1.600, confidence: 'high' },
  { id: 'hh-23', date: '2026-05-14', quantityKg: 2.030, confidence: 'high' },
  { id: 'hh-24', date: '2026-05-15', quantityKg: 1.130, confidence: 'high' },
  { id: 'hh-25', date: '2026-05-18', quantityKg: 3.335, confidence: 'high' },
  { id: 'hh-26', date: '2026-05-18', quantityKg: 0.300, confidence: 'high' },
  { id: 'hh-27', date: '2026-05-19', quantityKg: 4.000, confidence: 'high' },
  { id: 'hh-28', date: '2026-05-19', quantityKg: 0.360, confidence: 'high' },
  { id: 'hh-29', date: '2026-05-20', quantityKg: 4.100, confidence: 'high' },
  { id: 'hh-30', date: '2026-05-22', quantityKg: 5, confidence: 'high' },
  { id: 'hh-31', date: '2026-05-25', quantityKg: 5, confidence: 'high' },
  // Page: May 27 - Jun 24, 2026
  { id: 'hh-32', date: '2026-05-27', quantityKg: 6.500, confidence: 'high' },
  { id: 'hh-33', date: '2026-05-29', quantityKg: 4, confidence: 'high' },
  { id: 'hh-34', date: '2026-06-01', quantityKg: 4, confidence: 'high' },
  { id: 'hh-35', date: '2026-06-04', quantityKg: 5, confidence: 'high' },
  { id: 'hh-36', date: '2026-06-08', quantityKg: 7, confidence: 'low' },
  { id: 'hh-37', date: '2026-06-10', quantityKg: 5, confidence: 'high' },
  { id: 'hh-38', date: '2026-06-11', quantityKg: 2, confidence: 'high' },
  { id: 'hh-39', date: '2026-06-12', quantityKg: 4, confidence: 'high' },
  { id: 'hh-40', date: '2026-06-13', quantityKg: 1.500, confidence: 'high' },
  { id: 'hh-41', date: '2026-06-15', quantityKg: 3.750, confidence: 'high' },
  { id: 'hh-42', date: '2026-06-16', quantityKg: 2, confidence: 'high' },
  { id: 'hh-43', date: '2026-06-18', quantityKg: 3, confidence: 'high' },
  { id: 'hh-44', date: '2026-06-19', quantityKg: 2, confidence: 'low' },
  { id: 'hh-45', date: '2026-06-22', quantityKg: 3.8, confidence: 'low' },
  { id: 'hh-46', date: '2026-06-24', quantityKg: 4, confidence: 'high' },
  // Page: Jun 25 - Jul 8, 2026
  { id: 'hh-47', date: '2026-06-25', quantityKg: 2, confidence: 'high' },
  { id: 'hh-48', date: '2026-06-29', quantityKg: 7.5, confidence: 'low' },
  { id: 'hh-49', date: '2026-06-30', quantityKg: 2, confidence: 'high' },
  { id: 'hh-50', date: '2026-07-01', quantityKg: 2, confidence: 'high' },
  { id: 'hh-51', date: '2026-07-03', quantityKg: 5, confidence: 'high' },
  { id: 'hh-52', date: '2026-07-06', quantityKg: 7.5, confidence: 'low' },
  // 2026-07-07 and 2026-07-08 rows were open in the ledger with no weight filled in yet.
]

export function totalHibiscusHarvested() {
  return hibiscusHarvestLog.reduce((s, e) => s + e.quantityKg, 0)
}
