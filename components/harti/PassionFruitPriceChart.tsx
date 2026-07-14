'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'

interface PricePoint {
  weekStart: string
  weekEnd: string
  avgPriceRs: number
}

// Real Colombo wholesale Passion Fruit price, one point per saved HARTI
// weekly bulletin (harti_weekly_source) - builds up automatically as more
// weeks get saved, so this starts sparse and fills in over time.
export function PassionFruitPriceChart() {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error' } | { status: 'success'; points: PricePoint[] }
  >({ status: 'loading' })

  useEffect(() => {
    fetch('/api/harti-analysis/price-history')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setState({ status: 'success', points: data.points || [] })
      })
      .catch(() => setState({ status: 'error' }))
  }, [])

  // Errors and the loading state are both quiet no-ops here - this chart is
  // a nice-to-have enhancement (e.g. before the Supabase migration for
  // harti_weekly_source has been applied), not something worth surfacing an
  // error banner for on top of the main analysis above.
  if (state.status !== 'success' || state.points.length === 0) {
    return null
  }

  if (state.points.length < 2) {
    return (
      <Card>
        <CardHeader title="Passion Fruit Price History" subtitle="Colombo wholesale, Rs/kg per saved HARTI week" />
        <p className="text-sm text-brand-700/50">
          Only {state.points.length} week saved so far - the trend chart fills in as more weekly bulletins are archived (see Weekly Reports).
        </p>
      </Card>
    )
  }

  const data = state.points.map((p) => ({ week: formatDate(p.weekStart), price: Math.round(p.avgPriceRs) }))

  return (
    <Card>
      <CardHeader title="Passion Fruit Price History" subtitle="Colombo wholesale average, Rs/kg per saved HARTI week" />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef7ee" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#173b2e99' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#173b2e99' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #d4ecd5', fontSize: 12 }}
            formatter={(value) => [`Rs ${value}/kg`, 'Avg price']}
          />
          <Line type="monotone" dataKey="price" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
