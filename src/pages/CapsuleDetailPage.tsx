import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteCustomCapsule,
  loadCapsulesState,
  markCapsuleOutfitWorn,
  removeCapsuleEntry,
} from '@/lib/storage'
import { PRESET_CAPSULES, isPresetCapsuleId, paletteHexesFromOutfits, averageHarmonyScores, formatCapsuleDate } from '@/lib/capsules'
import type { CapsuleSavedEntry } from '@/types'
import { CapsuleFlatLayOutfitCard } from '@/components/CapsuleFlatLayOutfitCard'
import { preloadGarmentBackgroundRemoval } from '@/lib/garmentCutoutCache'
import '@/styles/theme.css'

function getEntriesForRouteId(capsuleId: string | undefined): {
  title: string
  icon: string
  entries: CapsuleSavedEntry[]
  isCustom: boolean
} | null {
  if (!capsuleId) return null
  const state = loadCapsulesState()
  if (isPresetCapsuleId(capsuleId)) {
    const def = PRESET_CAPSULES.find((p) => p.id === capsuleId)
    return {
      title: def?.name ?? capsuleId,
      icon: def?.icon ?? '📦',
      entries: state.presets[capsuleId],
      isCustom: false,
    }
  }
  const custom = state.customCapsules.find((c) => c.id === capsuleId)
  if (!custom) return null
  return { title: custom.name, icon: '✏️', entries: custom.entries, isCustom: true }
}

export function CapsuleDetailPage() {
  const { capsuleId } = useParams<{ capsuleId: string }>()
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  void tick

  const bundle = useMemo(() => getEntriesForRouteId(capsuleId), [capsuleId, tick])
  const refresh = () => setTick((n) => n + 1)

  useEffect(() => {
    void preloadGarmentBackgroundRemoval()
  }, [])

  if (!capsuleId || !bundle) {
    return (
      <div className="page page--capsule">
        <p>Capsule not found.</p>
        <Link to="/capsule">Back to Capsule</Link>
      </div>
    )
  }

  const { title, icon, entries, isCustom } = bundle
  const outfits = entries.map((e) => e.outfit)
  const palette = paletteHexesFromOutfits(outfits)
  const avgHarmony = averageHarmonyScores(entries.map((e) => e.harmonyScore))

  const handleWorn = (outfitId: string) => {
    markCapsuleOutfitWorn(capsuleId, outfitId)
    refresh()
  }

  const handleRemove = (outfitId: string) => {
    removeCapsuleEntry(capsuleId, outfitId)
    refresh()
  }

  const handleDeleteCapsule = () => {
    if (!isCustom) return
    if (!window.confirm(`Delete “${title}” and all looks inside?`)) return
    deleteCustomCapsule(capsuleId)
    navigate('/capsule')
  }

  const addOutfitHref = isCustom ? `/?capsuleTarget=${encodeURIComponent(capsuleId)}` : '/'

  return (
    <div className="page page--capsule">
      <nav className="capsule-detail-nav">
        <Link to="/capsule" className="capsule-detail-nav__back">
          ← Capsule
        </Link>
      </nav>

      <header className="capsule-detail-header">
        <span className="capsule-detail-header__icon" aria-hidden>
          {icon}
        </span>
        <div>
          <h1 className="capsule-detail-header__title">{title}</h1>
          <p className="capsule-detail-header__sub">
            {entries.length} outfit{entries.length === 1 ? '' : 's'}
            {avgHarmony != null ? ` · Avg Design Room score ${avgHarmony}` : ''}
          </p>
        </div>
      </header>

      <div className="capsule-detail-palette" aria-label="Capsule colour story">
        {palette.length === 0 ? (
          <span className="capsule-card__palette-empty">Palette appears when looks include tagged colours</span>
        ) : (
          palette.map((hex) => <span key={hex} className="capsule-detail-palette__swatch" style={{ backgroundColor: hex }} />)
        )}
      </div>

      <section className="capsule-flatlay-section" aria-label="Saved outfits in this capsule">
        <h2 className="capsule-flatlay-row-label">Saved looks</h2>
        <div className="capsule-flatlay-row">
          {entries.map((entry, index) => (
            <div key={entry.outfit.id} className="capsule-flatlay-slide">
              <CapsuleFlatLayOutfitCard entry={entry} variantIndex={index} />
              <div className="capsule-flatlay-slide__actions">
                <button type="button" className="capsule-flatlay-slide__action" onClick={() => handleWorn(entry.outfit.id)}>
                  Mark worn
                </button>
                <span className="capsule-flatlay-slide__action-sep" aria-hidden>
                  ·
                </span>
                <button type="button" className="capsule-flatlay-slide__action" onClick={() => handleRemove(entry.outfit.id)}>
                  Remove
                </button>
                <span className="capsule-flatlay-slide__saved">
                  Saved {formatCapsuleDate(entry.savedAt)}
                  {entry.lastWornAt ? ` · Worn ${formatCapsuleDate(entry.lastWornAt)}` : ''}
                </span>
              </div>
            </div>
          ))}
          <Link to={addOutfitHref} className="capsule-flatlay-add-card">
            <span className="capsule-flatlay-add-card__plus" aria-hidden>
              +
            </span>
            <span className="capsule-flatlay-add-card__label">Add outfit</span>
          </Link>
        </div>
      </section>

      {entries.length === 0 && (
        <p className="capsule-flatlay-empty-copy">
          Nothing here yet — save from Home (suggested outfits) or{' '}
          <Link to="/design-room">Design Room</Link>.
          {isCustom && (
            <>
              {' '}
              <Link to={addOutfitHref}>Open Home to save into this capsule</Link>.
            </>
          )}
        </p>
      )}

      {isCustom && (
        <div style={{ marginTop: '2rem' }}>
          <button type="button" className="btn btn-ghost" onClick={handleDeleteCapsule}>
            Delete custom capsule
          </button>
        </div>
      )}
    </div>
  )
}
