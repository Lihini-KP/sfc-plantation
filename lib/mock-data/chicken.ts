import type { ChickenBatch, EggLog, FeedLog, VaccinationRecord, ChickenHealthRecord } from '@/lib/types'

// The chicken farm has not started operations yet. The estate says it's
// planned to start this month (July 2026) - no exact day confirmed yet. No
// batches, eggs, feed, vaccinations or health records exist yet, so these
// stay empty rather than showing invented activity. Update
// `plannedStartDate` once an exact day is confirmed.
export const chickenFarmStatus = {
  operational: false,
  plannedStartMonth: 'July 2026',
  plannedStartDate: null as string | null,
  note: 'Planned to start this month (July 2026) - exact day not yet confirmed.',
}

export const chickenBatches: ChickenBatch[] = []
export const eggLogs: EggLog[] = []
export const feedLogs: FeedLog[] = []
export const vaccinations: VaccinationRecord[] = []
export const healthRecords: ChickenHealthRecord[] = []
