'use client'

import { useState } from 'react'
import { Sparkles, Send, TrendingUp, TrendingDown, Minus, CalendarCheck, Droplets, ShieldAlert } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/Badge'
import { ScoreRing, ProgressBar } from '@/components/ui/ProgressBar'
import { areas } from '@/lib/mock-data/areas'
import { aiAnalyses } from '@/lib/mock-data/aiInsights'
import { chatHistory, mockAiReply } from '@/lib/mock-data/aiInsights'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import type { ChatMessage } from '@/lib/types'

export function AiInsightsClient() {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].id)
  const analysis = aiAnalyses.find((a) => a.areaId === selectedAreaId)!
  const area = areas.find((a) => a.id === selectedAreaId)!

  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', content: input, timestamp: new Date().toISOString() }
    const reply: ChatMessage = { id: `m-${Date.now() + 1}`, role: 'assistant', content: mockAiReply(input), timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg, reply])
    setInput('')
  }

  const trendIcon = analysis.historicalComparison.trend === 'improving' ? TrendingUp : analysis.historicalComparison.trend === 'declining' ? TrendingDown : Minus

  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          These health scores, detected problems and predictions are <strong>illustrative sample analyses</strong> for this
          prototype - not output from a real vision model yet. Once weekly area photos are wired up to an AI vision pipeline,
          this page will show real detections instead.
        </p>
      </Card>
      <div className="flex flex-wrap gap-2">
        {areas.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAreaId(a.id)}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${selectedAreaId === a.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-brand-700/70 hover:bg-brand-50'}`}
          >
            {a.name.replace(' Plot', '')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <ScoreRing value={analysis.healthScore} />
                <div>
                  <p className="text-sm font-semibold text-brand-800">{area.name}</p>
                  <p className="text-xs text-brand-700/50">Analyzed {formatDate(analysis.analyzedAt)} · Confidence {analysis.confidence}%</p>
                  <div className="mt-1"><SeverityBadge severity={analysis.severity} /></div>
                </div>
              </div>
              <TrendBadge trend={analysis.historicalComparison.trend} pct={analysis.historicalComparison.improvementPct} Icon={trendIcon} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700"><ShieldAlert size={13} /> Detected Problems</p>
                {analysis.detectedProblems.length === 0 ? (
                  <p className="text-sm text-brand-700/50">No problems detected</p>
                ) : (
                  <ul className="space-y-1 text-sm text-brand-700/80">
                    {analysis.detectedProblems.map((p) => <li key={p}>• {p}</li>)}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700"><Sparkles size={13} /> Recommended Actions</p>
                <ul className="space-y-1 text-sm text-brand-700/80">
                  {analysis.recommendedActions.map((a) => <li key={a}>• {a}</li>)}
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Estimated Yield" />
              <p className="text-2xl font-semibold text-brand-800">{analysis.estimatedYieldKg.toLocaleString()} kg</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-brand-700/60">Expected Grade</span>
                <span className="font-medium text-brand-800">{analysis.expectedGrade}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-700/60">Estimated Revenue</span>
                <span className="font-medium text-brand-800">{formatCurrency(analysis.estimatedRevenue)}</span>
              </div>
            </Card>
            <Card>
              <CardHeader title="Harvest Prediction" action={<CalendarCheck size={16} className="text-brand-600" />} />
              <p className="text-2xl font-semibold text-brand-800">{analysis.daysRemaining} days remaining</p>
              <p className="text-sm text-brand-700/60">Expected: {formatDate(analysis.expectedHarvestDate)}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-brand-700/50">
                  <span>Readiness</span><span>{analysis.harvestReadinessPct}%</span>
                </div>
                <div className="mt-1"><ProgressBar value={analysis.harvestReadinessPct} /></div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Next Fertilizer Schedule" />
              <p className="text-sm"><span className="text-brand-700/60">Fertilizer: </span>{analysis.nextFertilizer.name}</p>
              <p className="text-sm"><span className="text-brand-700/60">Quantity: </span>{analysis.nextFertilizer.quantity}</p>
              <p className="text-sm"><span className="text-brand-700/60">Date: </span>{analysis.nextFertilizer.date}</p>
            </Card>
            <Card>
              <CardHeader title="Irrigation Recommendation" action={<Droplets size={16} className="text-brand-600" />} />
              <p className="text-sm"><span className="text-brand-700/60">Amount: </span>{analysis.irrigationRecommendation.amount}</p>
              <p className="text-sm"><span className="text-brand-700/60">Frequency: </span>{analysis.irrigationRecommendation.frequency}</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Disease Prevention" />
            <ul className="space-y-1 text-sm text-brand-700/80">
              {analysis.diseasePrevention.map((p) => <li key={p}>• {p}</li>)}
            </ul>
          </Card>
        </div>

        <Card className="flex h-[640px] flex-col">
          <CardHeader title="AI Chat Assistant" subtitle="Ask about any area, harvest timing, or fertilizer needs" />
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-800'}`}>
                  {m.content}
                  <p className={`mt-1 text-[10px] ${m.role === 'user' ? 'text-white/60' : 'text-brand-700/40'}`}>{formatDateTime(m.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="e.g. When should I harvest Area C?"
              className="flex-1 rounded-xl border border-brand-100 px-3 py-2.5 text-sm"
            />
            <button onClick={send} className="flex items-center justify-center rounded-xl bg-brand-600 px-3.5 text-white hover:bg-brand-700">
              <Send size={16} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TrendBadge({ trend, pct, Icon }: { trend: string; pct: number; Icon: typeof TrendingUp }) {
  const tone = trend === 'improving' ? 'text-status-healthy bg-status-healthy/10' : trend === 'declining' ? 'text-status-critical bg-status-critical/10' : 'text-brand-700/60 bg-brand-50'
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${tone}`}>
      <Icon size={13} /> {pct > 0 ? '+' : ''}{pct}% vs last week
    </span>
  )
}
