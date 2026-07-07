import { areas, crops, tasks, aiAnalyses, recentMonthlyDetail } from '@/lib/mock-data'

export function getDashboardStats() {
  const totalAreaAcres = areas.reduce((sum, a) => sum + a.sizeAcres, 0)
  const totalPlants = areas.reduce((sum, a) => sum + a.plantCount, 0)
  const healthyPlants = areas.filter((a) => a.healthStatus === 'healthy').reduce((sum, a) => sum + a.plantCount, 0)
  const attentionPlants = totalPlants - healthyPlants
  const harvestReadyAreas = aiAnalyses.filter((a) => a.harvestReadinessPct >= 85).length
  const upcomingHarvests = aiAnalyses.filter((a) => a.daysRemaining <= 21).length
  const weeklyProductionEstimateKg = Math.round(
    aiAnalyses.reduce((sum, a) => sum + a.estimatedYieldKg / (a.daysRemaining <= 7 ? 1 : 7), 0)
  )
  const activeTasks = tasks.filter((t) => t.status !== 'completed').length

  const latestMonth = recentMonthlyDetail[recentMonthlyDetail.length - 1]
  const latestMonthIncome = latestMonth.totalIncome
  const latestMonthExpenses = latestMonth.totalExpenses
  const latestMonthProfitLoss = latestMonth.profitLoss

  return {
    totalAreaAcres,
    totalCultivatedAreaAcres: totalAreaAcres,
    numberOfCrops: crops.length,
    totalPlants,
    healthyPlants,
    attentionPlants,
    harvestReadyAreas,
    upcomingHarvests,
    weeklyProductionEstimateKg,
    activeTasks,
    latestMonth: latestMonth.month,
    latestMonthIncome,
    latestMonthExpenses,
    latestMonthProfitLoss,
  }
}
