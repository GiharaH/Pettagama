import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '@/lib/storage'
import { getWardrobe } from '@/lib/storage'
import { fetchWeather, getCachedWeather, setCachedWeather } from '@/lib/weather'
import { suggestOutfits } from '@/lib/suggestions'
import { OCCASIONS } from '@/lib/constants'
import type { WeatherState, Outfit, Occasion } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'
import { OutfitCard } from '@/components/OutfitCard'
import { saveFavourites, getFavourites } from '@/lib/storage'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function Home() {
  const profile = getProfile()
  const [weather, setWeather] = useState<WeatherState | null>(getCachedWeather())
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [occasion, setOccasion] = useState<Occasion>('casual')
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [suggesting, setSuggesting] = useState(false)

  const wardrobe = getWardrobe()
  const hasEnough =
    wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'tops').length >= 1 &&
    wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'bottoms').length >= 1

  useEffect(() => {
    if (!profile?.locationGranted || !profile.lat || !profile.lon) return
    const cached = getCachedWeather()
    if (cached) {
      setWeather(cached)
      return
    }
    setWeatherLoading(true)
    fetchWeather(profile.lat, profile.lon)
      .then((w) => {
        setWeather(w)
        setCachedWeather(w)
      })
      .finally(() => setWeatherLoading(false))
  }, [profile?.locationGranted, profile?.lat, profile?.lon])

  const handleSuggest = () => {
    const weatherToUse = weather ?? {
      temp: 22,
      condition: 'clear' as const,
      description: 'No location — using mild default',
      tempBand: 'mild' as const,
      cachedAt: Date.now(),
    }
    setSuggesting(true)
    setTimeout(() => {
      const suggested = suggestOutfits(wardrobe, weatherToUse, occasion, 3)
      setOutfits(suggested)
      setSuggesting(false)
    }, 600)
  }

  const handleSaveFavourite = (outfit: Outfit) => {
    const favs = getFavourites()
    if (favs.some((f) => f.outfit.id === outfit.id)) return
    favs.push({ outfit, savedAt: new Date().toISOString() })
    saveFavourites(favs)
  }

  return (
    <div className="page">
      <BrandHeader eyebrow="Today" title="What to wear" tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {weather && (
        <div className="card card-accent-teal" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>🌡️</span>
            <div>
              <strong style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)' }}>
                {weather.temp}°C · {weather.tempBand}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--brown-mid)' }}>{weather.description}</div>
            </div>
          </div>
          {weatherLoading && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Updating weather…</p>}
        </div>
      )}

      <label className="field-label">Occasion</label>
      <select
        value={occasion}
        onChange={(e) => setOccasion(e.target.value as Occasion)}
        className="field-control"
        style={{ marginBottom: '1.1rem' }}
      >
        {OCCASIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {!weather && !weatherLoading && (
        <p style={{ fontSize: '0.9rem', color: 'var(--brown-mid)', marginBottom: '1rem' }}>
          Enable location in settings for weather-based suggestions. You can still get outfit ideas from your wardrobe.
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleSuggest}
        disabled={!hasEnough || suggesting}
        aria-busy={suggesting}
      >
        {suggesting ? 'Suggesting…' : 'Suggest 3 outfits'}
      </button>

      {!hasEnough && (
        <p style={{ fontSize: '0.85rem', color: 'var(--brown-mid)', marginTop: '1rem' }}>
          Add at least one top and one bottom to your <Link to="/wardrobe">wardrobe</Link> to get suggestions.
        </p>
      )}

      {outfits.length > 0 && (
        <section style={{ marginTop: '2rem' }} aria-label="Suggested outfits">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
            Your outfits
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} onSave={() => handleSaveFavourite(outfit)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
