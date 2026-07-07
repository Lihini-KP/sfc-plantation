'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { monthlyFinance, recentMonthlyDetail } from '@/lib/mock-data/finance'

export function FinanceTrendChart() {
  const data = [
    ...monthlyFinance.map((m) => ({ month: m.month, Income: Math.round(m.income), Expenses: Math.round(m.expenses) })),
    ...recentMonthlyDetail.map((m) => ({ month: m.month, Income: Math.round(m.totalIncome), Expenses: Math.round(m.totalExpenses) })),
  ]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef7ee" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#173b2e99' }} axisLine={false} tickLine={false} interval={2} />
        <YAxis tick={{ fontSize: 11, fill: '#173b2e99' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4ecd5', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Income" stroke="#15803d" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
