import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCustomCapsule, loadCapsulesState } from '@/lib/storage'
import {
  PRESET_CAPSULES,
  PRESET_CAPSULE_ORDER,
  paletteHexesFromOutfits,
  averageHarmonyScores,
  formatCapsuleDate,
  type PresetCapsuleId,
} from '@/lib/capsules'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

function maxIso(dates: (string | undefined)[]): string | undefined {
  const ok = dates.filter((d): d is string => Boolean(d))
  if (ok.length === 0) return undefined
  return ok.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
}

export function CapsuleListPage() {
  const [version, setVersion] = useState(0)
  const state = useMemo(() => loadCapsulesState(), [version])

  const refresh = () => setVersion((v) => v + 1)

  const handleAddCustom = () => {
    const name = window.prompt('Name your capsule', 'My capsule')
    if (name === null) return
    createCustomCapsule(name)
    refresh()
  }

  const totalLooks = PRESET_CAPSULE_ORDER.reduce((n, id) => n + state.presets[id].length, 0) +
    state.customCapsules.reduce((n, c) => n + c.entries.length, 0)

  return (
    <div className="page page--capsule">
      <BrandHeader eyebrow="Wardrobe" title="Capsule" tagline="Mini wardrobes for every part of your life." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {totalLooks === 0 && (
        <div className="card card-accent-mid capsule-empty-hint" style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            No saved looks yet. Use <strong>Save look to Capsule</strong> on Home (we sort by occasion) or save from{' '}
            <Link to="/design-room">Design Room</Link> — scores show up here as your capsule average.
          </p>
        </div>
      )}

      <ul className="capsule-grid" aria-label="Your capsules">
        {PRESET_CAPSULES.map((def) => {
          const entries = state.presets[def.id as PresetCapsuleId]
          const outfits = entries.map((e) => e.outfit)
          const palette = paletteHexesFromOutfits(outfits)
          const avgHarmony = averageHarmonyScores(entries.map((e) => e.harmonyScore))
          const lastWorn = maxIso(entries.map((e) => e.lastWornAt))
          const lastSaved = maxIso(entries.map((e) => e.savedAt))

          return (
            <li key={def.id}>
              <Link className="capsule-card" to={`/capsule/${def.id}`}>
                <div className="capsule-card__head">
                  <span className="capsule-card__icon" aria-hidden>
                    {def.icon}
                  </span>
                  <div className="capsule-card__titles">
                    <span className="capsule-card__name">{def.name}</span>
                    {def.notes && <span className="capsule-card__notes">{def.notes}</span>}
                  </div>
                </div>
                <div className="capsule-card__count">{entries.length} outfit{entries.length === 1 ? '' : 's'}</div>
                <div className="capsule-card__palette" aria-hidden>
                  {palette.length === 0 ? (
                    <span className="capsule-card__palette-empty">Colour story fills in as you save looks</span>
                  ) : (
                    palette.map((hex) => <span key={hex} className="capsule-card__swatch" style={{ backgroundColor: hex }} />)
                  )}
                </div>
                <div className="capsule-card__meta">
                  <span>Last worn · {formatCapsuleDate(lastWorn)}</span>
                  <span>Updated · {formatCapsuleDate(lastSaved)}</span>
                </div>
                <div className="capsule-card__grade">
                  {avgHarmony != null ? (
                    <>Design Room · avg score {avgHarmony}</>
                  ) : (
                    <>Design Room · no scores yet</>
                  )}
                </div>
              </Link>
            </li>
          )
        })}

        {state.customCapsules.map((cap) => {
          const entries = cap.entries
          const outfits = entries.map((e) => e.outfit)
          const palette = paletteHexesFromOutfits(outfits)
          const avgHarmony = averageHarmonyScores(entries.map((e) => e.harmonyScore))
          const lastWorn = maxIso(entries.map((e) => e.lastWornAt))
          const lastSaved = maxIso(entries.map((e) => e.savedAt))

          return (
            <li key={cap.id}>
              <Link className="capsule-card capsule-card--custom" to={`/capsule/${cap.id}`}>
                <div className="capsule-card__head">
                  <span className="capsule-card__icon" aria-hidden>
                    ✏️
                  </span>
                  <div className="capsule-card__titles">
                    <span className="capsule-card__name">{cap.name}</span>
                    <span className="capsule-card__notes">Custom capsule</span>
                  </div>
                </div>
                <div className="capsule-card__count">{entries.length} outfit{entries.length === 1 ? '' : 's'}</div>
                <div className="capsule-card__palette" aria-hidden>
                  {palette.length === 0 ? (
                    <span className="capsule-card__palette-empty">Colour story fills in as you save looks</span>
                  ) : (
                    palette.map((hex) => <span key={hex} className="capsule-card__swatch" style={{ backgroundColor: hex }} />)
                  )}
                </div>
                <div className="capsule-card__meta">
                  <span>Last worn · {formatCapsuleDate(lastWorn)}</span>
                  <span>Updated · {formatCapsuleDate(lastSaved)}</span>
                </div>
                <div className="capsule-card__grade">
                  {avgHarmony != null ? (
                    <>Design Room · avg score {avgHarmony}</>
                  ) : (
                    <>Design Room · no scores yet</>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="capsule-actions">
        <button type="button" className="btn btn-ghost btn-block capsule-actions__btn" onClick={handleAddCustom}>
          + Custom capsule
        </button>
      </div>
    </div>
  )
}
