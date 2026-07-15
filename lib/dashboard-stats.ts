import { tasks, aiAnalyses, recentMonthlyDetail } from '@/lib/mock-data'

export function getDashboardStats() {
  const weeklyProductionEstimateKg = Math.round(
    aiAnalyses.reduce((sum, a) => sum + a.estimatedYieldKg / (a.daysRemaining <= 7 ? 1 : 7), 0)
  )
  const activeTasks = tasks.filter((t) => t.status !== 'completed').length

  const latestMonth = recentMonthlyDetail[recentMonthlyDetail.length - 1]
  const latestMonthIncome = latestMonth.totalIncome
  const latestMonthExpenses = latestMonth.totalExpenses
  const latestMonthProfitLoss = latestMonth.profitLoss

  return {
    // Updated current figures provided 2026-07-15, ahead of the individual
    // plantation area/crop records in lib/mock-data being updated to match -
    // see DashboardStatsGrid's PROVISIONAL_NOTE shown on these cards.
    totalAreaAcres: 7.5,
    totalCultivatedAreaAcres: 2.5,
    numberOfCrops: 14,
    totalPlants: 6345,
    healthyPlants: 4500,
    attentionPlants: 1845,
    harvestReadyAreas: 7,
    upcomingHarvests: 7,
    weeklyProductionEstimateKg,
    activeTasks,
    latestMonth: latestMonth.month,
    latestMonthIncome,
    latestMonthExpenses,
    latestMonthProfitLoss,
  }
}
