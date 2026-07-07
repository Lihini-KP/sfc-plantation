// Sourced directly from the estate's "P&L Cultivation" Google Sheet.
// Note: the sheet's own "Tolal" row lists Profit/Loss as a positive figure,
// but Income minus Expenses computes to a loss - shown here as the computed
// loss (Income - Expenses), with the raw totals kept alongside for audit.
export interface MonthlyFinance {
  month: string
  expenses: number
  income: number
}

export const monthlyFinance: MonthlyFinance[] = [
  { month: 'Sep 2024', expenses: 468487.58, income: 183363.60 },
  { month: 'Oct 2024', expenses: 630665.31, income: 150933.80 },
  { month: 'Nov 2024', expenses: 1215310.84, income: 185797.75 },
  { month: 'Dec 2024', expenses: 1257671.84, income: 227356.90 },
  { month: 'Jan 2025', expenses: 843500.97, income: 279656.00 },
  { month: 'Feb 2025', expenses: 699882.59, income: 1096921.70 },
  { month: 'Mar 2025', expenses: 803658.14, income: 1400573.50 },
  { month: 'Apr 2025', expenses: 704448.63, income: 833397.00 },
  { month: 'May 2025', expenses: 654581.02, income: 406449.00 },
  { month: 'Jun 2025', expenses: 659718.26, income: 707126.00 },
  { month: 'Jul 2025', expenses: 666915.26, income: 447593.25 },
  { month: 'Aug 2025', expenses: 647535.26, income: 218465.50 },
  { month: 'Sep 2025', expenses: 564248.23, income: 198999.75 },
  { month: 'Oct 2025', expenses: 529397.09, income: 155256.25 },
  { month: 'Nov 2025', expenses: 501209.12, income: 178971.00 },
  { month: 'Dec 2025', expenses: 570006.73, income: 139007.00 },
]

export function profitLoss(m: MonthlyFinance) {
  return m.income - m.expenses
}

export function totalExpenses() {
  return monthlyFinance.reduce((s, m) => s + m.expenses, 0)
}
export function totalIncome() {
  return monthlyFinance.reduce((s, m) => s + m.income, 0)
}
export function totalProfitLoss() {
  return totalIncome() - totalExpenses()
}

// Bank account fund balance as recorded 2025-04-08.
export const bankFund = { amount: 2150000, asOf: '2025-04-08' }

// More recent monthly detail (not yet folded into the summary table above).
export interface MonthlyDetail {
  month: string
  totalExpenses: number
  totalIncome: number
  profitLoss: number
  expenseNote?: string
}

export const recentMonthlyDetail: MonthlyDetail[] = [
  { month: 'Jan 2026', totalExpenses: 497441.76, totalIncome: 144425.30, profitLoss: 144425.30 - 497441.76, expenseNote: 'Source sheet\'s printed expense total (44,478.76) appears mistyped - recomputed from itemized rows (Salaries, Wifi & Cameras, CCTV/Tubewell depreciation, Electricity, Water, Others, Fertilizer, Burnt paddy husk).' },
  { month: 'Feb 2026', totalExpenses: 475946.26, totalIncome: 214187.50, profitLoss: 214187.50 - 475946.26 },
  { month: 'Mar 2026', totalExpenses: 228230.26, totalIncome: 188027.00, profitLoss: 188027.00 - 228230.26 },
  { month: 'Apr 2026', totalExpenses: 210677.66, totalIncome: 67663.25, profitLoss: 67663.25 - 210677.66 },
  { month: 'May 2026', totalExpenses: 208128.49, totalIncome: 49219.00, profitLoss: 49219.00 - 208128.49 },
]
