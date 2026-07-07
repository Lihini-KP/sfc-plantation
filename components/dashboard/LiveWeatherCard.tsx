'use client'

import { useEffect, useState } from 'react'
import { CloudRain, Droplets, Wind, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { fetchLiveForecast, type LiveForecast } from '@/lib/weather-api'
import { ESTATE_LOCATION } from '@/lib/estate-config'
import { formatDate } from '@/lib/format'

export function LiveWeatherCard() {
  const [forecast, setForecast] = useState<LiveForecast | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    fetchLiveForecast(ESTATE_LOCATION.latitude, ESTATE_LOCATION.longitude)
      .then((f) => {
        setForecast(f)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <Card>
      <CardHeader title="Weather" subtitle="Live from Open-Meteo" />
      {status === 'loading' && <p className="py-8 text-center text-sm text-brand-700/40">Fetching live weather...</p>}
      {status === 'error' && <p className="py-8 text-center text-sm text-status-critical">Couldn&apos;t fetch live weather.</p>}
      {status === 'success' && forecast && (
        <>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <CloudRain size={26} />
            </span>
            <div>
              <p className="text-2xl font-semibold text-brand-800">{Math.round(forecast.current.temperatureC)}°C</p>
              <p className="text-sm text-brand-700/60">{forecast.current.condition}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-brand-50 p-2">
              <Droplets size={15} className="mx-auto text-brand-600" />
              <p className="mt-1 text-xs font-medium text-brand-700">{forecast.current.humidityPct}%</p>
              <p className="text-[11px] text-brand-700/50">Humidity</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-2">
              <Wind size={15} className="mx-auto text-brand-600" />
              <p className="mt-1 text-xs font-medium text-brand-700">{Math.round(forecast.current.windKmh)} km/h</p>
              <p className="text-[11px] text-brand-700/50">Wind</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {forecast.daily.slice(1, 4).map((d) => (
              <div key={d.date} className="flex items-center justify-between text-sm">
                <span className="text-brand-700/70">{formatDate(d.date)}</span>
                <span className="text-brand-700/50">{d.condition}</span>
                <span className="font-medium text-brand-800">{Math.round(d.highC)}° / {Math.round(d.lowC)}°</span>
              </div>
            ))}
          </div>
          {!ESTATE_LOCATION.confirmed && (
            <p className="mt-3 flex items-center gap-1 text-[10px] text-status-attention">
              <AlertTriangle size={10} /> Using placeholder coordinates - confirm exact estate location
            </p>
          )}
        </>
      )}
    </Card>
  )
}
