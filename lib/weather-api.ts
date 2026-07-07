// Live weather via Open-Meteo (free, no API key required, CORS-enabled).
// https://open-meteo.com/en/docs
const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

export interface LiveWeather {
  condition: string
  temperatureC: number
  humidityPct: number
  precipitationMm: number
  windKmh: number
  fetchedAt: string
}

export async function fetchLiveWeather(latitude: number, longitude: number): Promise<LiveWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API request failed: ${res.status}`)
  const data = await res.json()
  const current = data.current
  return {
    condition: WMO_CONDITIONS[current.weather_code] ?? `Unknown (code ${current.weather_code})`,
    temperatureC: current.temperature_2m,
    humidityPct: current.relative_humidity_2m,
    precipitationMm: current.precipitation,
    windKmh: current.wind_speed_10m,
    fetchedAt: current.time,
  }
}

export interface DailyForecastDay {
  date: string
  condition: string
  highC: number
  lowC: number
  precipitationProbabilityPct: number
}

export interface LiveForecast {
  current: LiveWeather
  daily: DailyForecastDay[]
}

export async function fetchLiveForecast(latitude: number, longitude: number, days = 4): Promise<LiveForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=${days}&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather API request failed: ${res.status}`)
  const data = await res.json()
  const current = data.current
  const daily: DailyForecastDay[] = data.daily.time.map((date: string, i: number) => ({
    date,
    condition: WMO_CONDITIONS[data.daily.weather_code[i]] ?? `Unknown (code ${data.daily.weather_code[i]})`,
    highC: data.daily.temperature_2m_max[i],
    lowC: data.daily.temperature_2m_min[i],
    precipitationProbabilityPct: data.daily.precipitation_probability_max[i],
  }))
  return {
    current: {
      condition: WMO_CONDITIONS[current.weather_code] ?? `Unknown (code ${current.weather_code})`,
      temperatureC: current.temperature_2m,
      humidityPct: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      windKmh: current.wind_speed_10m,
      fetchedAt: current.time,
    },
    daily,
  }
}
