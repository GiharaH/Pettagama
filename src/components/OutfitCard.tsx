import { useState } from 'react'
import type { Outfit } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { ImprovementAction, OutfitImprovementSuggestion } from '@/lib/outfitImprovements'
import { getEnhanceVisualsFromImprovements } from '@/lib/improvementVisuals'
import { OutfitEnhanceDummy } from '@/components/OutfitEnhanceDummy'
import { ImprovementActionCard, effectiveWishlistKey } from '@/components/ImprovementActionCard'
import { addWishlistFromAction, getWishlist } from '@/lib/storage'
import '@/styles/theme.css'

interface OutfitCardProps {
  outfit: Outfit
  onSave?: () => void
  /** When true, the save action is shown as already completed. */
  savedToFavourites?: boolean
  saveButtonLabel?: string
  improvements?: OutfitImprovementSuggestion
}

function ItemThumb({ item, label }: { item: { id: string; imageUrl: string; name: string }; label: string }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <div className="clothing-img-wrap" style={{ aspectRatio: '1', borderRadius: 4 }}>
        <img src={item.imageUrl} alt="" />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--brown-mid)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  )
}

export function OutfitCard({
  outfit,
  onSave,
  savedToFavourites,
  saveButtonLabel = 'Save look to favourites',
  improvements,
}: OutfitCardProps) {
  const pieces = [
    outfit.top && { item: outfit.top, label: CATEGORY_LABELS[outfit.top.category] },
    outfit.bottom && { item: outfit.bottom, label: CATEGORY_LABELS[outfit.bottom.category] },
    outfit.outerwear && { item: outfit.outerwear, label: CATEGORY_LABELS[outfit.outerwear.category] },
    outfit.footwear && { item: outfit.footwear, label: CATEGORY_LABELS[outfit.footwear.category] },
  ].filter(Boolean) as { item: { id: string; imageUrl: string; name: string }; label: string }[]

  const enhanceVisuals = improvements ? getEnhanceVisualsFromImprovements(improvements) : null

  const [wishlistIds, setWishlistIds] = useState(() => new Set(getWishlist().map((i) => i.id)))

  const handleWishlist = (action: ImprovementAction) => {
    if (addWishlistFromAction(action)) {
      setWishlistIds(new Set(getWishlist().map((i) => i.id)))
    }
  }

  return (
    <div className="card card-accent-brown">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {pieces.map((p) => (
          <ItemThumb key={p.item.id} item={p.item} label={p.label} />
        ))}
      </div>
      {outfit.accessories.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--brown-mid)', marginBottom: '0.5rem' }}>
          + {outfit.accessories.length} accessory{outfit.accessories.length > 1 ? 'ies' : ''}
        </div>
      )}
      {onSave && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: '0.5rem' }}
          onClick={onSave}
          disabled={savedToFavourites}
        >
          {savedToFavourites ? 'Saved to Favourites' : saveButtonLabel}
        </button>
      )}

      {improvements && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Improve this outfit
          </div>

          {enhanceVisuals && (
            <OutfitEnhanceDummy
              outfit={outfit}
              addImageUrls={enhanceVisuals.addImages}
              swatchColors={enhanceVisuals.swatches}
            />
          )}

          {improvements.overall_explanation.trim().length > 0 && (
            <p className="improve-one-liner">{improvements.overall_explanation.trim()}</p>
          )}

          <div className="improve-directions">
            {improvements.directions.map((d) => (
              <div key={d.title} className="improve-direction-block">
                <div className="improve-direction-title">{d.title}</div>
                <div className="improve-actions-scroll" role="list">
                  {d.actions.map((a) => (
                    <div key={effectiveWishlistKey(a)} role="listitem">
                      <ImprovementActionCard
                        action={a}
                        inWishlist={wishlistIds.has(effectiveWishlistKey(a))}
                        onAddWishlist={() => handleWishlist(a)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
