import type { Outfit } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { OutfitImprovementSuggestion } from '@/lib/outfitImprovements'
import '@/styles/theme.css'

interface OutfitCardProps {
  outfit: Outfit
  onSave?: () => void
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

export function OutfitCard({ outfit, onSave, improvements }: OutfitCardProps) {
  const pieces = [
    outfit.top && { item: outfit.top, label: CATEGORY_LABELS[outfit.top.category] },
    outfit.bottom && { item: outfit.bottom, label: CATEGORY_LABELS[outfit.bottom.category] },
    outfit.outerwear && { item: outfit.outerwear, label: CATEGORY_LABELS[outfit.outerwear.category] },
    outfit.footwear && { item: outfit.footwear, label: CATEGORY_LABELS[outfit.footwear.category] },
  ].filter(Boolean) as { item: { id: string; imageUrl: string; name: string }; label: string }[]

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
        <button type="button" className="btn btn-ghost" style={{ marginTop: '0.5rem' }} onClick={onSave}>
          Save to favourites
        </button>
      )}

      {improvements && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            border: '1px solid rgba(84, 49, 26, 0.12)',
            borderRadius: 4,
            background: 'rgba(245, 231, 222, 0.35)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Improve this outfit
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {improvements.directions.map((d) => (
              <div
                key={d.title}
                style={{
                  padding: '0.6rem',
                  borderRadius: 4,
                  background: 'rgba(255, 250, 246, 0.75)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)', fontWeight: 700 }}>
                  {d.title}
                </div>
                <div style={{ color: 'var(--brown-mid)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.15rem' }}>
                  {d.style_archetype}
                </div>
                <div style={{ marginTop: '0.4rem', color: 'var(--brown-mid)', fontSize: '0.85rem' }}>
                  {d.actions.map((a, idx) => (
                    <div key={`${d.title}-${idx}`} style={{ marginTop: idx === 0 ? 0 : '0.25rem' }}>
                      <strong style={{ color: 'var(--brown-dark)' }}>{a.type === 'add' ? 'Add' : 'Swap'}</strong>: {a.item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {improvements.missing_items.length > 0 && (
            <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: 'var(--brown-mid)' }}>
              <strong style={{ color: 'var(--brown-dark)' }}>Missing items:</strong>{' '}
              {improvements.missing_items.map((m) => m.item).join(', ')}
            </div>
          )}

          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--brown-mid)' }}>
            {improvements.overall_explanation.trim()}
          </div>
        </div>
      )}
    </div>
  )
}
