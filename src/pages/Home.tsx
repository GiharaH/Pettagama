import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProfile, getUserDetails } from '@/lib/storage'
import { getWardrobe } from '@/lib/storage'
import { fetchWeather, getCachedWeather, setCachedWeather } from '@/lib/weather'
import { suggestOutfits } from '@/lib/suggestions'
import { OCCASIONS } from '@/lib/constants'
import type { WeatherState, Outfit, Occasion } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'
import { OutfitCard } from '@/components/OutfitCard'
import {
  clearSuggestedOutfits,
  getAllCapsuleEntries,
  getFavourites,
  getSuggestedOutfits,
  loadCapsulesState,
  recordOutfitsShown,
  saveFavouriteBySignature,
  saveSuggestedOutfits,
  type SuggestedOutfitEntry,
} from '@/lib/storage'
import { outfitSignature } from '@/lib/outfitSignature'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const profile = getProfile()
  const userDetails = getUserDetails()
  const [weather, setWeather] = useState<WeatherState | null>(getCachedWeather())
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [occasion, setOccasion] = useState<Occasion>('casual')
  const [suggesting, setSuggesting] = useState(false)
  const [savedEntries, setSavedEntries] = useState<SuggestedOutfitEntry[]>(() => getSuggestedOutfits())
  const [favSigs, setFavSigs] = useState(() => new Set(getFavourites().map((f) => outfitSignature(f.outfit))))

  const rawCapsuleTarget = searchParams.get('capsuleTarget')
  const customSaveTarget = useMemo(() => {
    if (!rawCapsuleTarget || !rawCapsuleTarget.startsWith('custom-')) return null
    const st = loadCapsulesState()
    const c = st.customCapsules.find((x) => x.id === rawCapsuleTarget)
    return c ? { id: c.id, name: c.name } : null
  }, [rawCapsuleTarget])

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
      .catch(() => {
        setWeather({
          temp: 22,
          condition: 'clear',
          description: 'Weather unavailable — using mild default',
          tempBand: 'mild',
          cachedAt: Date.now(),
        })
      })
      .finally(() => setWeatherLoading(false))
  }, [profile?.locationGranted, profile?.lat, profile?.lon])

  const handleDeleteAllSuggested = () => {
    clearSuggestedOutfits()
    setSavedEntries([])
  }

  const handleRemoveSuggested = (outfitId: string) => {
    const next = getSuggestedOutfits().filter((e) => e.outfit.id !== outfitId)
    saveSuggestedOutfits(next)
    setSavedEntries(next)
  }

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
      const prev = getSuggestedOutfits()
      const onPage = new Set(prev.map((e) => outfitSignature(e.outfit)))
      const savedToCapsule = new Set(getAllCapsuleEntries().map((e) => outfitSignature(e.outfit)))
      // Only exclude outfits already saved in Capsule (and duplicates already on this page).
      // This keeps occasion-based suggestions flowing even for smaller wardrobes.
      const exclude = new Set([...savedToCapsule, ...onPage])
      let suggested = suggestOutfits(wardrobe, weatherToUse, occasion, 3, { excludeSignatures: exclude })

      // If we couldn't find anything new, retry by only excluding Capsule-saved outfits.
      // This allows repeats for users who haven't saved anything yet (or have small wardrobes).
      if (suggested.length === 0) {
        suggested = suggestOutfits(wardrobe, weatherToUse, occasion, 3, { excludeSignatures: savedToCapsule })
      }

      // Last resort: always produce *something* (never block the user).
      // We still avoid repeats against Capsule wherever possible above.
      if (suggested.length === 0) {
        suggested = suggestOutfits(wardrobe, weatherToUse, occasion, 3)
      }

      const addedAt = new Date().toISOString()
      const newEntries: SuggestedOutfitEntry[] = suggested.map((o) => ({
        outfit: o,
        occasion,
        weather: weatherToUse,
        addedAt,
      }))
      saveSuggestedOutfits([...prev, ...newEntries])
      // Keep tracking for analytics/recent history, but it no longer blocks suggestions.
      recordOutfitsShown(suggested.map(outfitSignature))
      setSavedEntries(getSuggestedOutfits())
      setSuggesting(false)
    }, 600)
  }

  const handleSaveFavourite = (outfit: Outfit, occasion: Occasion) => {
    const ok = saveFavouriteBySignature(outfit, {
      occasion,
      ...(customSaveTarget ? { capsuleId: customSaveTarget.id } : {}),
    })
    if (ok) {
      setFavSigs((prev) => new Set([...prev, outfitSignature(outfit)]))
    }
  }

  const clearCustomCapsuleTarget = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('capsuleTarget')
    setSearchParams(next, { replace: true })
  }

  const displayName = userDetails.name?.trim() || null

  return (
    <div className="page page--home">
      <BrandHeader
        eyebrow={displayName ? `Welcome back, ${displayName}` : 'Home'}
        title="What's the occasion today?"
        tagline="Let your wardrobe think for you."
      />
      {customSaveTarget && (
        <div
          className="card card-accent-teal-mid"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
          role="status"
        >
          <span>
            Saving looks to <strong>{customSaveTarget.name}</strong> (custom capsule).
          </span>
          <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={clearCustomCapsuleTarget}>
            Use default capsules
          </button>
        </div>
      )}
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      <div className="card card-accent-teal" style={{ marginBottom: '1.25rem' }} role="region" aria-label="Today's weather">
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--teal-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Today&apos;s weather
          </div>
          {weather ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem' }}>🌡️</span>
                <div>
                  <strong style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)' }}>
                    {weather.temp}°C · {weather.tempBand}
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--brown-mid)' }}>{weather.description}</div>
                </div>
              </div>
              {weatherLoading && (
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--home-muted-soft)' }}>Updating weather…</p>
              )}
            </>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--home-muted)', margin: 0 }}>
              Enable location in Profile or settings for weather-based suggestions. You can still get outfit ideas from your wardrobe.
            </p>
          )}
        </div>

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

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleSuggest}
        disabled={!hasEnough || suggesting}
        aria-busy={suggesting}
      >
        {suggesting ? 'Suggesting…' : 'Suggest 3 outfits'}
      </button>

      {/* Intentionally no blocking “no outfits available” message — always generate something. */}

      {!hasEnough && (
        <p style={{ fontSize: '0.85rem', color: 'var(--home-muted)', marginTop: '1rem' }}>
          Add at least one top and one bottom to your <Link to="/wardrobe">wardrobe</Link> to get suggestions.
        </p>
      )}

      {savedEntries.length > 0 && (
        <section style={{ marginTop: '2rem' }} aria-label="Suggested outfits">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <h2 className="home-suggested-heading">Suggested outfits</h2>
            <button type="button" className="btn btn-ghost" style={{ fontSize: '0.85rem' }} onClick={handleDeleteAllSuggested}>
              Delete all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {savedEntries.map((entry) => (
              <div key={entry.outfit.id}>
                <OutfitCard
                  outfit={entry.outfit}
                  onSave={() => handleSaveFavourite(entry.outfit, entry.occasion)}
                  savedToFavourites={favSigs.has(outfitSignature(entry.outfit))}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={() => handleRemoveSuggested(entry.outfit.id)}
                >
                  Remove this outfit
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--home-muted)' }}>
        <Link to="/capsule">View saved outfits (Capsule)</Link>
        {' · '}
        <Link to="/wishlist">Wishlist</Link>
      </p>
    </div>
  )
}
