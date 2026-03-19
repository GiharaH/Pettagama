import type { WeatherState } from '@/types'

const CACHE_MS = 30 * 60 * 1000 // 30 min

function tempBand(temp: number): WeatherState['tempBand'] {
  if (temp < 15) return 'cold'
  if (temp <= 24) return 'mild'
  if (temp <= 32) return 'warm'
  return 'hot'
}

/** Map Open-Meteo WMO weather code to our condition and description */
function mapWeatherCode(code: number): { condition: WeatherState['condition']; description: string } {
  const c = Math.round(code)
  if (c === 0) return { condition: 'clear', description: 'Clear sky' }
  if (c >= 1 && c <= 3) return { condition: 'clouds', description: c === 1 ? 'Mainly clear' : c === 2 ? 'Partly cloudy' : 'Overcast' }
  if (c === 45 || c === 48) return { condition: 'clouds', description: 'Foggy' }
  if (c >= 51 && c <= 67) return { condition: 'rain', description: c <= 57 ? 'Drizzle' : 'Rain' }
  if (c >= 71 && c <= 77) return { condition: 'snow', description: 'Snow' }
  if (c >= 80 && c <= 82) return { condition: 'rain', description: 'Rain showers' }
  if (c >= 85 && c <= 86) return { condition: 'snow', description: 'Snow showers' }
  if (c >= 95 && c <= 99) return { condition: 'rain', description: 'Thunderstorm' }
  return { condition: 'unknown', description: 'Unknown' }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherState> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Weather fetch failed: ${res.status} ${text}`)
  }

  const data = await res.json() as {
    current?: { temperature_2m?: number; weather_code?: number }
  }

  const current = data.current
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Invalid weather response')
  }

  const temp = Math.round(current.temperature_2m)
  const code = typeof current.weather_code === 'number' ? current.weather_code : 0
  const { condition, description } = mapWeatherCode(code)

  return {
    temp,
    condition,
    description,
    tempBand: tempBand(current.temperature_2m),
    cachedAt: Date.now(),
  }
}

export function getCachedWeather(): WeatherState | null {
  try {
    const raw = sessionStorage.getItem('pettagama_weather')
    if (!raw) return null
    const cached = JSON.parse(raw) as WeatherState
    if (Date.now() - cached.cachedAt > CACHE_MS) return null
    return cached
  } catch {
    return null
  }
}

export function setCachedWeather(weather: WeatherState): void {
  sessionStorage.setItem('pettagama_weather', JSON.stringify(weather))
}
