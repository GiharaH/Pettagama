import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteCustomCapsule,
  loadCapsulesState,
  markCapsuleOutfitWorn,
  removeCapsuleEntry,
} from '@/lib/storage'
import { PRESET_CAPSULES, isPresetCapsuleId, paletteHexesFromOutfits, averageHarmonyScores, formatCapsuleDate } from '@/lib/capsules'
import type { CapsuleSavedEntry } from '@/types'
import { OutfitCard } from '@/components/OutfitCard'
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

      {entries.length === 0 ? (
        <div className="card card-accent-mid" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ margin: 0 }}>
            Nothing here yet — save from Home (suggested outfits) or Design Room.
            {isCustom && (
              <>
                {' '}
                <Link to={`/?capsuleTarget=${encodeURIComponent(capsuleId)}`}>Open Home to save into this capsule</Link>.
              </>
            )}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {entries.map((entry) => (
            <div key={entry.outfit.id} className="capsule-detail-row">
              <OutfitCard outfit={entry.outfit} />
              <div className="capsule-detail-row__meta">
                {entry.harmonyScore != null && (
                  <span className="capsule-detail-row__score">Design Room score when saved · {entry.harmonyScore}</span>
                )}
                <span className="capsule-detail-row__dates">
                  Saved {formatCapsuleDate(entry.savedAt)}
                  {entry.lastWornAt && ` · Worn ${formatCapsuleDate(entry.lastWornAt)}`}
                </span>
              </div>
              <div className="capsule-detail-row__actions">
                <button type="button" className="btn btn-ghost" onClick={() => handleWorn(entry.outfit.id)}>
                  Mark worn today
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => handleRemove(entry.outfit.id)}>
                  Remove from capsule
                </button>
              </div>
            </div>
          ))}
        </div>
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
