import type { WeatherState } from '@/types'

const CACHE_MS = 30 * 60 * 1000 // 30 min

function tempBand(temp: number): WeatherState['tempBand'] {
  if (temp < 15) return 'cold'
  if (temp <= 24) return 'mild'
  if (temp <= 32) return 'warm'
  return 'hot'
}

function mapCondition(weather: { id: number }): WeatherState['condition'] {
  const id = weather.id
  if (id >= 200 && id < 300) return 'rain'
  if (id >= 300 && id < 600) return 'rain'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 700 && id < 800) return 'wind'
  if (id === 800) return 'clear'
  if (id > 800) return 'clouds'
  return 'unknown'
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherState> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!apiKey) {
    return {
      temp: 22,
      condition: 'clear',
      description: 'Demo mode — add VITE_OPENWEATHER_API_KEY for real weather',
      tempBand: 'mild',
      cachedAt: Date.now(),
    }
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()
  return {
    temp: Math.round(data.main.temp),
    condition: mapCondition(data.weather[0]),
    description: data.weather[0].description ?? '',
    tempBand: tempBand(data.main.temp),
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
