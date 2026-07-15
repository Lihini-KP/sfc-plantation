'use client'

import { useEffect, useState } from 'react'
import { Upload, Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SeverityBadge } from '@/components/ui/Badge'
import { getPhotoLogsForTunnel } from '@/lib/mock-data/tunnelPhotoLogs'
import { crops } from '@/lib/mock-data/crops'
import { useRole } from '@/lib/role-context'
import { formatDate } from '@/lib/format'
import type { TunnelPhotoEntry, Severity } from '@/lib/types'

const STORAGE_PREFIX = 'sfc-tunnel-photos-'

interface AnalysisResult {
  healthAssessment: string
  detectedIssues: string[]
  recommendedActions: string[]
  severity: Severity
}

export function TunnelPhotosSection({ tunnelId, tunnelName, cropName }: { tunnelId: string; tunnelName: string; cropName: string }) {
  const { currentUser } = useRole()
  const seedLogs = getPhotoLogsForTunnel(tunnelId)
  const [serverLogs, setServerLogs] = useState<TunnelPhotoEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<{ id: string; message: string } | null>(null)

  async function loadServerLogs() {
    try {
      const res = await fetch(`/api/tunnel-photos?tunnelId=${encodeURIComponent(tunnelId)}`)
      const data = await res.json()
      if (res.ok) setServerLogs(data.logs || [])
    } catch { /* ignore - shows empty state below */ } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    // One-time migration: this browser may still hold entries saved before
    // tunnel photos were wired to a shared backend (localStorage-only, so
    // only visible on the device that uploaded them). Push any found here up
    // to the shared table, then clear them so they aren't resubmitted next
    // visit and everyone (not just this device) can see them from then on.
    async function migrateLegacyLocalEntries() {
      const key = STORAGE_PREFIX + tunnelId
      const saved = localStorage.getItem(key)
      if (!saved) return
      // Claim the key synchronously (before any await) so a second effect
      // invocation - e.g. React Strict Mode's dev-only double-mount - can't
      // read the same entries again and double-submit them.
      localStorage.removeItem(key)
      let legacy: TunnelPhotoEntry[] = []
      try { legacy = JSON.parse(saved) } catch { /* corrupt - drop it */ }
      if (legacy.length > 0) {
        await Promise.all(
          legacy.map((entry) =>
            fetch('/api/tunnel-photos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            }).catch(() => { /* best-effort - this entry just won't migrate */ })
          )
        )
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off migration + initial fetch on mount, not deriving state
    migrateLegacyLocalEntries().then(loadServerLogs)
  }, [tunnelId])

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  function compressImage(dataUrl: string, maxDimension = 1280, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(dataUrl); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = dataUrl
    })
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const compressed = Array.from(files)
      .slice(0, 2)
      .map((file) => readFileAsDataUrl(file).then((dataUrl) => compressImage(dataUrl)))
    Promise.all(compressed).then((urls) => {
      setPendingPhotos(urls)
      setAnalysisResult(null)
      setAnalysisError('')
      analyzePhotos(urls)
    })
  }

  async function analyzePhotos(photos: string[]) {
    setAnalyzing(true)
    setAnalysisError('')
    try {
      const res = await fetch('/api/analyze-tunnel-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tunnelName, cropName, photos }),
      })
      let data
      try {
        data = await res.json()
      } catch {
        throw new Error(res.status === 413 ? 'Photos were too large to send for analysis.' : `Analysis failed (server returned status ${res.status}).`)
      }
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')
      setAnalysisResult(data)
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function saveWeek() {
    if (pendingPhotos.length === 0) return
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      photos: pendingPhotos,
      healthAssessment: analysisResult?.healthAssessment || notes || undefined,
      detectedIssues: analysisResult?.detectedIssues,
      recommendedActions: analysisResult?.recommendedActions,
      severity: analysisResult?.severity,
      analyzedBy: analysisResult ? 'Claude vision - automated analysis' : notes ? 'Manual note - not yet AI-analyzed' : undefined,
    }
    const res = await fetch('/api/tunnel-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tunnelId, ...entry }),
    })
    if (!res.ok) {
      setAnalysisError('Could not save this week - the entry was not stored. Please try again.')
      return
    }
    await loadServerLogs()
    recordDailyUpdate({ ...entry, id: '', tunnelId })
    setPendingPhotos([])
    setNotes('')
    setAnalysisResult(null)
    setAnalysisError('')
  }

  function recordDailyUpdate(entry: TunnelPhotoEntry) {
    const matchedCrop = crops.find((c) => c.name.toLowerCase() === cropName.toLowerCase())
    const notesParts = [`Tunnel ${tunnelName} weekly photo review.`]
    if (entry.healthAssessment) notesParts.push(entry.healthAssessment)
    if (entry.recommendedActions?.length) notesParts.push(`Recommended: ${entry.recommendedActions.join('; ')}`)

    fetch('/api/daily-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: entry.date,
        areaId: null,
        cropId: matchedCrop?.id || null,
        activity: 'Tunnel Photo Review',
        staff: currentUser ? [currentUser.name] : [],
        weather: '',
        wateringDetails: '',
        fertilizerApplied: '',
        pesticideApplied: '',
        diseasesFound: entry.detectedIssues?.join(', ') || '',
        pestIssues: '',
        notes: notesParts.join(' '),
        photoCount: entry.photos.length,
      }),
    }).catch(() => { /* best-effort - the tunnel photo log itself already saved */ })
  }

  // Re-runs AI vision analysis for an entry whose photo was saved but never
  // got an assessment attached (e.g. the analysis call failed or was skipped
  // at upload time) - the photo itself is already stored, so this reuses it
  // rather than asking anyone to re-upload.
  async function retroAnalyze(log: TunnelPhotoEntry) {
    setRetryingId(log.id)
    setRetryError(null)
    try {
      const res = await fetch('/api/analyze-tunnel-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tunnelName, cropName, photos: log.photos }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')

      const patchRes = await fetch(`/api/tunnel-photos/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthAssessment: data.healthAssessment,
          detectedIssues: data.detectedIssues,
          recommendedActions: data.recommendedActions,
          severity: data.severity,
          analyzedBy: 'Claude vision - automated analysis (retro-analyzed)',
        }),
      })
      if (!patchRes.ok) throw new Error('Analysis succeeded but could not be saved.')

      await loadServerLogs()
    } catch (err) {
      setRetryError({ id: log.id, message: err instanceof Error ? err.message : 'Analysis failed.' })
    } finally {
      setRetryingId(null)
    }
  }

  const allLogs = [...serverLogs, ...seedLogs].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Upload two photos once a week. Photos and assessments are saved to the shared database, so every user sees
          the same log regardless of device. Photos are analyzed automatically by Claude&apos;s vision model as soon
          as you select them - a general-purpose AI reading of the images, not a specialized trained plant-pathology
          model. Saving a week also logs a &quot;Tunnel Photo Review&quot; entry in Daily Updates.
        </p>
      </Card>

      <Card>
        <CardHeader title="Upload This Week's Photos" subtitle="2 photos recommended" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="w-full rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-3 py-2 text-xs text-brand-700/70"
        />
        {pendingPhotos.length > 0 && (
          <div className="mt-3 flex gap-2">
            {pendingPhotos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt={`Preview ${i + 1}`} className="h-24 w-24 rounded-xl object-cover" />
            ))}
          </div>
        )}

        {analyzing && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700/70">
            <Loader2 size={14} className="animate-spin" /> Analyzing photos with Claude vision...
          </div>
        )}

        {analysisError && (
          <div className="mt-3 rounded-xl bg-status-critical/10 p-3 text-xs text-status-critical">
            {analysisError} You can still add notes manually below and save.
          </div>
        )}

        {analysisResult && !analyzing && (
          <div className="mt-3 space-y-2 rounded-xl bg-brand-50 p-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700"><Sparkles size={13} /> AI Assessment</p>
              <SeverityBadge severity={analysisResult.severity} />
            </div>
            <p className="text-xs text-brand-700/70">{analysisResult.healthAssessment}</p>
            {analysisResult.detectedIssues.length > 0 && (
              <ul className="space-y-0.5 text-xs text-brand-700/70">
                {analysisResult.detectedIssues.map((issue) => <li key={issue}>• {issue}</li>)}
              </ul>
            )}
          </div>
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional: add your own notes to go with the AI assessment (or write one manually if AI analysis failed)"
          className="mt-3 w-full rounded-xl border border-brand-100 px-3 py-2 text-sm"
          rows={3}
        />
        <button
          onClick={saveWeek}
          disabled={pendingPhotos.length === 0 || analyzing}
          className="mt-3 flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        >
          <Upload size={15} /> Save This Week
        </button>
      </Card>

      {logsLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-700/60">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : allLogs.length === 0 ? (
        <p className="py-6 text-center text-sm text-brand-700/40">No photos uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {allLogs.map((log) => {
            const isServerLog = serverLogs.some((s) => s.id === log.id)
            const canRetryAnalyze = isServerLog && log.photos.length > 0 && !log.healthAssessment
            return (
            <Card key={log.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-800">{formatDate(log.date)}</p>
                  {log.analyzedBy && <p className="text-[11px] text-brand-700/40">{log.analyzedBy}</p>}
                </div>
                {log.severity && <SeverityBadge severity={log.severity} />}
              </div>
              {log.photos.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {log.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt={`${log.date} photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              {canRetryAnalyze && (
                <div className="mt-3 rounded-xl bg-amber-50 p-3">
                  <p className="text-xs text-amber-800">
                    This photo was saved without an AI assessment (the analysis likely failed at upload time).
                  </p>
                  <button
                    onClick={() => retroAnalyze(log)}
                    disabled={retryingId === log.id}
                    className="mt-2 flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {retryingId === log.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {retryingId === log.id ? 'Analyzing...' : 'Analyze Now'}
                  </button>
                  {retryError?.id === log.id && (
                    <p className="mt-2 text-xs text-status-critical">{retryError.message}</p>
                  )}
                </div>
              )}
              {log.healthAssessment && (
                <div className="mt-3 rounded-xl bg-brand-50 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700"><Sparkles size={13} /> Assessment</p>
                  <p className="text-xs text-brand-700/70">{log.healthAssessment}</p>
                </div>
              )}
              {log.detectedIssues && log.detectedIssues.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700"><AlertTriangle size={13} /> Detected Issues</p>
                  <ul className="space-y-0.5 text-xs text-brand-700/70">
                    {log.detectedIssues.map((issue) => <li key={issue}>• {issue}</li>)}
                  </ul>
                </div>
              )}
              {log.recommendedActions && log.recommendedActions.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs font-semibold text-brand-700">Recommended Actions</p>
                  <ul className="space-y-0.5 text-xs text-brand-700/70">
                    {log.recommendedActions.map((action) => <li key={action}>• {action}</li>)}
                  </ul>
                </div>
              )}
            </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
