'use client'

import { useEffect, useState } from 'react'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'

interface DailySummaryEntry {
  date: string
  summary: string
  sentToTelegram: boolean
  photos: string[]
  generatedAt: string
}

export function DailySummarySection() {
  const [summaries, setSummaries] = useState<DailySummaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/daily-summary')
      .then((res) => res.json())
      .then((data) => setSummaries(data.summaries || []))
      .catch(() => { /* shows empty state below */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50">
        <p className="flex items-center gap-1.5 text-xs text-brand-700/70">
          <Sparkles size={13} /> One AI-written summary per day, compiled automatically from that day&apos;s logged
          updates and mirrored to the CropWatch Telegram group - the message there updates live as more entries are
          logged, rather than posting again each time.
        </p>
      </Card>

      {loading && (
        <Card>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        </Card>
      )}

      {!loading && summaries.length === 0 && (
        <Card><p className="py-4 text-center text-sm text-brand-700/40">No daily summaries yet - one is generated automatically the first time an update is logged for a given day.</p></Card>
      )}

      {!loading && summaries.map((s) => (
        <Card key={s.date}>
          <CardHeader
            title={formatDate(s.date)}
            subtitle={`Generated ${new Date(s.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
            action={
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.sentToTelegram ? 'bg-status-healthy/10 text-status-healthy' : 'bg-brand-100 text-brand-700/50'}`}>
                <Send size={11} /> {s.sentToTelegram ? 'Sent to Telegram' : 'Not sent'}
              </span>
            }
          />
          <p className="whitespace-pre-line text-sm text-brand-700/80">{s.summary}</p>
          {s.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {s.photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p} alt={`${formatDate(s.date)} photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
