'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Image as ImageIcon, Video, RefreshCw, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { Card, CardHeader } from '@/components/ui/Card'
import { areas, crops, dailyUpdates as initialUpdates } from '@/lib/mock-data'
import type { DailyUpdate } from '@/lib/types'
import { formatDate } from '@/lib/format'
import { fetchLiveWeather, type LiveWeather } from '@/lib/weather-api'
import { ESTATE_LOCATION } from '@/lib/estate-config'
import { DailySummarySection } from './DailySummarySection'

const activityTypes = ['Watering', 'Fertilizing', 'Weeding', 'Pest control', 'Disease inspection', 'Pruning', 'Harvesting', 'Tunnel Photo Review']
const staffOptions = ['R Thambiraja', 'W A A N Wijesooriya', 'N M G Dharmasena', 'W.G. Dissanayaka', 'Malar Kanthi', 'Richard']

type UpdateForm = Omit<DailyUpdate, 'id' | 'areaId' | 'cropId' | 'cropIds' | 'photos'> & { areaId: string; cropIds: string[]; photos: string[] }

function emptyForm(): UpdateForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    areaId: areas[0].id,
    cropIds: areas[0].cropId ? [areas[0].cropId] : [],
    activity: activityTypes[0],
    staff: [],
    weather: '',
    wateringDetails: '',
    fertilizerApplied: '',
    pesticideApplied: '',
    diseasesFound: '',
    pestIssues: '',
    notes: '',
    photoCount: 0,
    photos: [],
  }
}

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

export function UpdatesClient() {
  const [activeTab, setActiveTab] = useState<'log' | 'summary'>('log')
  const [updates, setUpdates] = useState<DailyUpdate[]>(initialUpdates)
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [filters, setFilters] = useState({ areaId: 'all', cropId: 'all', staff: 'all', activity: 'all', date: '' })
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null)
  const [photosProcessing, setPhotosProcessing] = useState(false)

  function handlePhotoFiles(files: FileList | null) {
    if (!files) return
    setPhotosProcessing(true)
    Promise.all(
      Array.from(files)
        .slice(0, 4)
        .map((file) => readFileAsDataUrl(file).then((dataUrl) => compressImage(dataUrl)))
    )
      .then((photos) => setForm((f) => ({ ...f, photos, photoCount: photos.length })))
      .finally(() => setPhotosProcessing(false))
  }

  useEffect(() => {
    fetch('/api/daily-updates')
      .then((res) => res.json())
      .then((data) => {
        if (data.updates) {
          setUpdates(data.updates)
          setLoadStatus('success')
        } else {
          setLoadStatus('error')
        }
      })
      .catch(() => setLoadStatus('error'))
  }, [])

  async function loadLiveWeather() {
    setWeatherStatus('loading')
    try {
      const result = await fetchLiveWeather(ESTATE_LOCATION.latitude, ESTATE_LOCATION.longitude)
      setLiveWeather(result)
      setForm((f) => ({ ...f, weather: `${result.condition}, ${Math.round(result.temperatureC)}°C` }))
      setWeatherStatus('success')
    } catch {
      setWeatherStatus('error')
    }
  }

  useEffect(() => {
    // Fetching live weather when the modal opens is the desired behavior;
    // the "loading" state set at the top of loadLiveWeather is intentional,
    // not a cascading-render bug.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (showForm) loadLiveWeather()
  }, [showForm])

  const filtered = useMemo(() => {
    return updates
      .filter((u) => filters.areaId === 'all' || u.areaId === filters.areaId)
      .filter((u) => filters.cropId === 'all' || u.cropIds?.includes(filters.cropId) || u.cropId === filters.cropId)
      .filter((u) => filters.staff === 'all' || u.staff.includes(filters.staff))
      .filter((u) => filters.activity === 'all' || u.activity === filters.activity)
      .filter((u) => !filters.date || u.date === filters.date)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [updates, filters])

  async function submit() {
    setSubmitStatus('saving')
    try {
      const res = await fetch('/api/daily-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.update) throw new Error(data.error || 'Save failed.')
      setUpdates((prev) => [data.update, ...prev])
      setForm(emptyForm())
      setShowForm(false)
      setSubmitStatus('idle')
    } catch {
      setSubmitStatus('error')
    }
  }

  function toggleStaff(name: string) {
    setForm((f) => ({
      ...f,
      staff: f.staff.includes(name) ? f.staff.filter((s) => s !== name) : [...f.staff, name],
    }))
  }

  function toggleCrop(cropId: string) {
    setForm((f) => ({
      ...f,
      cropIds: f.cropIds.includes(cropId) ? f.cropIds.filter((c) => c !== cropId) : [...f.cropIds, cropId],
    }))
  }

  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-brand-50">
        <p className="text-xs text-brand-700/70">
          Updates are saved to the shared database - visible to everyone logged in, on any device.
        </p>
      </Card>
      {loadStatus === 'error' && (
        <Card className="border-status-critical/30 bg-status-critical/5">
          <p className="text-xs text-status-critical">Couldn&apos;t load updates from the database. Check your connection and reload the page.</p>
        </Card>
      )}

      <div className="flex gap-2 border-b border-brand-100">
        {(['log', 'summary'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab ? 'border-b-2 border-brand-600 text-brand-700' : 'text-brand-700/50 hover:text-brand-700',
            )}
          >
            {tab === 'log' ? 'Update Log' : 'Daily Summary'}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && <DailySummarySection />}

      {activeTab === 'log' && (
        <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader title="Filters" subtitle="Filter the plantation update history" />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Log New Update
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <select className="rounded-xl border border-brand-100 px-3 py-2 text-sm" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })}>
            <option value="">Any date</option>
            {[...new Set(updates.map((u) => u.date))].sort().reverse().map((d) => (
              <option key={d} value={d}>{formatDate(d)}</option>
            ))}
          </select>
          <select className="rounded-xl border border-brand-100 px-3 py-2 text-sm" value={filters.areaId} onChange={(e) => setFilters({ ...filters, areaId: e.target.value })}>
            <option value="all">All areas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="rounded-xl border border-brand-100 px-3 py-2 text-sm" value={filters.cropId} onChange={(e) => setFilters({ ...filters, cropId: e.target.value })}>
            <option value="all">All crops</option>
            {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border border-brand-100 px-3 py-2 text-sm" value={filters.staff} onChange={(e) => setFilters({ ...filters, staff: e.target.value })}>
            <option value="all">All employees</option>
            {staffOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border border-brand-100 px-3 py-2 text-sm" value={filters.activity} onChange={(e) => setFilters({ ...filters, activity: e.target.value })}>
            <option value="all">All activities</option>
            {activityTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card><p className="text-sm text-brand-700/60">No updates match the current filters.</p></Card>
        )}
        {filtered.map((u) => {
          const area = areas.find((a) => a.id === u.areaId)
          const cropIdsForEntry = u.cropIds?.length ? u.cropIds : u.cropId ? [u.cropId] : []
          const cropNames = cropIdsForEntry.map((id) => crops.find((c) => c.id === id)?.name).filter(Boolean)
          const label = [area?.name, cropNames.join(', ')].filter(Boolean).join(' · ')
          return (
            <Card key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-800">{formatDate(u.date)}{label ? ` · ${label}` : ''}</p>
                  <p className="text-xs text-brand-700/50">
                    {[u.activity, u.staff.join(', ') || 'Unassigned', u.weather].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-brand-700/50">
                  <span className="flex items-center gap-1"><ImageIcon size={13} /> {u.photoCount}</span>
                  <span className="flex items-center gap-1"><Video size={13} /> 0</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-brand-700/50">Watering: </span>{u.wateringDetails || '—'}</p>
                <p><span className="text-brand-700/50">Fertilizer: </span>{u.fertilizerApplied || '—'}</p>
                <p><span className="text-brand-700/50">Pesticide: </span>{u.pesticideApplied || '—'}</p>
                <p><span className="text-brand-700/50">Diseases: </span>{u.diseasesFound || 'None'}</p>
                <p><span className="text-brand-700/50">Pests: </span>{u.pestIssues || 'None'}</p>
              </div>
              {u.notes && <p className="mt-2 rounded-lg bg-brand-50 p-2 text-sm text-brand-700/80">{u.notes}</p>}
              {u.photos && u.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {u.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt={`${formatDate(u.date)} photo ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="relative h-24 shrink-0 overflow-hidden rounded-t-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/estate-photo.jpg"
                alt="Aerial view of the Silk Food Ceylon estate"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(120deg, rgba(12,27,21,0.88) 0%, rgba(21,128,61,0.55) 55%, rgba(12,27,21,0.35) 100%)' }}
              />
              <div className="relative z-10 flex h-full items-center justify-between px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Silk Food Ceylon</p>
                  <h3 className="text-lg font-semibold text-white">Log New Plantation Update</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Date</span>
                <input type="date" className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Area</span>
                <select className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.areaId} onChange={(e) => {
                  const area = areas.find((a) => a.id === e.target.value)
                  setForm({ ...form, areaId: e.target.value, cropIds: area?.cropId ? [area.cropId] : form.cropIds })
                }}>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-brand-700/60">Crops - select any number</span>
                <div className="flex flex-wrap gap-2">
                  {crops.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCrop(c.id)}
                      className={clsx(
                        'rounded-full border px-3 py-1.5 text-xs font-medium',
                        form.cropIds.includes(c.id) ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-brand-700/70',
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Activity</span>
                <select className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}>
                  {activityTypes.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-brand-700/60">Staff Members</span>
                <div className="flex flex-wrap gap-2">
                  {staffOptions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleStaff(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${form.staff.includes(s) ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-brand-700/70'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </label>
              <label className="text-sm">
                <span className="mb-1 flex items-center justify-between text-brand-700/60">
                  <span>Weather Condition</span>
                  <button
                    type="button"
                    onClick={loadLiveWeather}
                    disabled={weatherStatus === 'loading'}
                    className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={weatherStatus === 'loading' ? 'animate-spin' : ''} /> Refresh
                  </button>
                </span>
                <input
                  className="w-full rounded-xl border border-brand-100 px-3 py-2"
                  placeholder={weatherStatus === 'loading' ? 'Fetching live weather...' : 'e.g. Sunny'}
                  value={form.weather}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })}
                />
                {weatherStatus === 'success' && liveWeather && (
                  <span className="mt-1 block text-[10px] text-brand-700/40">
                    Live from Open-Meteo · {liveWeather.humidityPct}% humidity · {liveWeather.windKmh} km/h wind
                    {!ESTATE_LOCATION.confirmed && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-status-attention">
                        <AlertTriangle size={9} /> using placeholder coordinates - confirm exact estate location
                      </span>
                    )}
                  </span>
                )}
                {weatherStatus === 'error' && (
                  <span className="mt-1 block text-[10px] text-status-critical">Couldn&apos;t fetch live weather - enter manually.</span>
                )}
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Watering Details</span>
                <input className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.wateringDetails} onChange={(e) => setForm({ ...form, wateringDetails: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Fertilizer Applied</span>
                <input className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.fertilizerApplied} onChange={(e) => setForm({ ...form, fertilizerApplied: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Pesticide Applied</span>
                <input className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.pesticideApplied} onChange={(e) => setForm({ ...form, pesticideApplied: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Diseases Found</span>
                <input className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.diseasesFound} onChange={(e) => setForm({ ...form, diseasesFound: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-brand-700/60">Pest Issues</span>
                <input className="w-full rounded-xl border border-brand-100 px-3 py-2" value={form.pestIssues} onChange={(e) => setForm({ ...form, pestIssues: e.target.value })} />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-brand-700/60">Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                  className="w-full rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-3 py-2 text-xs text-brand-700/70"
                />
                {photosProcessing && (
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-brand-700/50">
                    <RefreshCw size={11} className="animate-spin" /> Processing photos...
                  </span>
                )}
                {form.photos.length > 0 && !photosProcessing && (
                  <div className="mt-2 flex gap-2">
                    {form.photos.map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={p} alt={`Preview ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                <span className="mt-1 block text-[11px] text-brand-700/40">
                  Up to 4 photos - saved to the shared database, visible to everyone. Video upload isn&apos;t supported
                  yet (video files are too large for this storage approach).
                </span>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-brand-700/60">Notes</span>
                <textarea className="w-full rounded-xl border border-brand-100 px-3 py-2" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
            </div>
            {submitStatus === 'error' && (
              <p className="mt-3 text-xs text-status-critical">Couldn&apos;t save this update - check your connection and try again.</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-brand-100 px-4 py-2 text-sm font-medium text-brand-700">Cancel</button>
              <button onClick={submit} disabled={submitStatus === 'saving'} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                {submitStatus === 'saving' ? 'Saving...' : 'Save Update'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
