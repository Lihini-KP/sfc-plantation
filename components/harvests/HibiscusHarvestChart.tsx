'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { hibiscusHarvestLog } from '@/lib/mock-data/hibiscusHarvestLog'
import { formatDate } from '@/lib/format'

export function HibiscusHarvestChart() {
  const data = hibiscusHarvestLog
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: formatDate(e.date), kg: e.quantityKg }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="hibiscusKg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef7ee" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#173b2e99' }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: '#173b2e99' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4ecd5', fontSize: 12 }} />
        <Area type="monotone" dataKey="kg" stroke="#dc2626" strokeWidth={2} fill="url(#hibiscusKg)" name="Harvested (kg)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
