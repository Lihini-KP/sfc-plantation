// Generic harvest-plan projector: given real logged harvest dates for a
// crop, estimates the typical interval between harvests and projects the
// next few expected dates. Works for any crop's log, not just Hibiscus.
export interface HarvestPlanProjection {
  averageIntervalDays: number
  minIntervalDays: number
  maxIntervalDays: number
  lastHarvestDate: string
  nextProjectedDates: string[]
  sampleSize: number
}

const DAY_MS = 24 * 60 * 60 * 1000

export function projectHarvestPlan(dates: string[], projectCount = 5): HarvestPlanProjection | null {
  const uniqueSorted = [...new Set(dates)].sort()
  if (uniqueSorted.length < 2) return null

  const intervals: number[] = []
  for (let i = 1; i < uniqueSorted.length; i++) {
    const diff = Math.round((new Date(uniqueSorted[i]).getTime() - new Date(uniqueSorted[i - 1]).getTime()) / DAY_MS)
    if (diff > 0) intervals.push(diff)
  }
  if (intervals.length === 0) return null

  const averageIntervalDays = Math.round((intervals.reduce((s, d) => s + d, 0) / intervals.length) * 10) / 10
  const minIntervalDays = Math.min(...intervals)
  const maxIntervalDays = Math.max(...intervals)
  const lastHarvestDate = uniqueSorted[uniqueSorted.length - 1]

  const nextProjectedDates: string[] = []
  let cursor = new Date(lastHarvestDate).getTime()
  for (let i = 0; i < projectCount; i++) {
    cursor += Math.round(averageIntervalDays) * DAY_MS
    nextProjectedDates.push(new Date(cursor).toISOString().slice(0, 10))
  }

  return { averageIntervalDays, minIntervalDays, maxIntervalDays, lastHarvestDate, nextProjectedDates, sampleSize: intervals.length }
}
