import { useState } from 'react'
import type { Outfit, WardrobeItem } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import { GarmentCutoutImage } from '@/components/GarmentCutoutImage'
import { HairAdvisorPopup, HairAdvisorTriggerButton } from '@/components/HairAdvisorPopup'
import { inferNecklineTypeForTop } from '@/lib/necklineInference'
import '@/styles/theme.css'

interface OutfitCardProps {
  outfit: Outfit
  onSave?: () => void
  /** When true, the save action is shown as already completed. */
  savedToFavourites?: boolean
  saveButtonLabel?: string
}

function splitAccessoriesForPreview(outfit: Outfit): { bag?: WardrobeItem; jewellery?: WardrobeItem } {
  let bag: WardrobeItem | undefined
  let jewellery: WardrobeItem | undefined
  const jewCats = new Set(['necklace', 'earrings_rings', 'bangles_bracelets', 'belt_scarf'])

  for (const a of outfit.accessories) {
    if (a.category === 'bag_clutch' && !bag) {
      bag = a
      continue
    }
    if (jewCats.has(a.category) && !jewellery) {
      jewellery = a
    }
  }

  if (!jewellery) {
    for (const a of outfit.accessories) {
      if (a !== bag && !jewellery) {
        jewellery = a
        break
      }
    }
  }

  return { bag, jewellery }
}

export function OutfitCard({
  outfit,
  onSave,
  savedToFavourites,
  saveButtonLabel = 'Save look to Capsule',
}: OutfitCardProps) {
  const { bag, jewellery } = splitAccessoriesForPreview(outfit)

  const topLabel = outfit.top ? CATEGORY_LABELS[outfit.top.category] : null
  const layerLabel = outfit.outerwear ? CATEGORY_LABELS[outfit.outerwear.category] : null
  const bottomLabel = outfit.bottom ? CATEGORY_LABELS[outfit.bottom.category] : null
  const shoeLabel = outfit.footwear ? CATEGORY_LABELS[outfit.footwear.category] : null
  const bagLabel = bag ? CATEGORY_LABELS[bag.category] : null
  const jewelleryLabel = jewellery ? CATEGORY_LABELS[jewellery.category] : null

  const pillLabels = [topLabel, layerLabel, bottomLabel, shoeLabel, bagLabel, jewelleryLabel].filter(Boolean) as string[]
  const hasLayerRow = Boolean(outfit.outerwear || bag || jewellery)

  const [hairAdvisorOpen, setHairAdvisorOpen] = useState(false)

  return (
    <div className="card card-accent-brown">
      <div className="suggested-outfit-stack" aria-label="Suggested outfit preview">
        {outfit.top && (
          <div className="suggested-outfit-oval suggested-outfit-oval--main">
            <GarmentCutoutImage src={outfit.top.imageUrl} alt={outfit.top.name} className="suggested-outfit-oval__img" />
          </div>
        )}

        {outfit.top && hasLayerRow && <div className="suggested-outfit-connector-v" aria-hidden />}
        {hasLayerRow && (
          <div className="suggested-outfit-horizontal-row" aria-hidden>
            {outfit.outerwear && (
              <div className="suggested-outfit-oval suggested-outfit-oval--main">
                <GarmentCutoutImage
                  src={outfit.outerwear.imageUrl}
                  alt={outfit.outerwear.name}
                  className="suggested-outfit-oval__img"
                />
              </div>
            )}
            {bag && (
              <div className="suggested-outfit-oval suggested-outfit-oval--secondary">
                <GarmentCutoutImage src={bag.imageUrl} alt={bag.name} className="suggested-outfit-oval__img" />
              </div>
            )}
            {jewellery && (
              <div className="suggested-outfit-oval suggested-outfit-oval--secondary">
                <GarmentCutoutImage src={jewellery.imageUrl} alt={jewellery.name} className="suggested-outfit-oval__img" />
              </div>
            )}
          </div>
        )}

        {outfit.top && outfit.bottom && !hasLayerRow && <div className="suggested-outfit-connector-v" aria-hidden />}
        {hasLayerRow && outfit.bottom && <div className="suggested-outfit-connector-v" aria-hidden />}
        {outfit.bottom && (
          <div className="suggested-outfit-oval suggested-outfit-oval--main">
            <GarmentCutoutImage src={outfit.bottom.imageUrl} alt={outfit.bottom.name} className="suggested-outfit-oval__img" />
          </div>
        )}

        {outfit.bottom && outfit.footwear && <div className="suggested-outfit-connector-v" aria-hidden />}
        {outfit.footwear && (
          <div className="suggested-outfit-oval suggested-outfit-oval--secondary">
            <GarmentCutoutImage
              src={outfit.footwear.imageUrl}
              alt={outfit.footwear.name}
              className="suggested-outfit-oval__img"
            />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem', justifyContent: 'center' }}>
        {pillLabels.map((label) => (
          <span key={label} className="tag" style={{ margin: 0 }}>
            {label}
          </span>
        ))}
      </div>
      {outfit.accessories.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--brown-mid)', marginBottom: '0.5rem' }}>
          + {outfit.accessories.length} accessory{outfit.accessories.length > 1 ? 'ies' : ''}
        </div>
      )}
      {outfit.top && (
        <>
          <HairAdvisorTriggerButton onClick={() => setHairAdvisorOpen(true)} />
          <HairAdvisorPopup
            open={hairAdvisorOpen}
            onClose={() => setHairAdvisorOpen(false)}
            outfit={outfit}
            initialNecklineKey={outfit.top.necklineType ?? inferNecklineTypeForTop(outfit.top)}
          />
        </>
      )}
      {onSave && (
        <button
          type="button"
          className="btn btn-block outfit-card-save-capsule"
          onClick={onSave}
          disabled={savedToFavourites}
        >
          {savedToFavourites ? 'Saved to Capsule' : saveButtonLabel}
        </button>
      )}
    </div>
  )
}
