import type { Outfit } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import '@/styles/theme.css'

interface OutfitCardProps {
  outfit: Outfit
  onSave?: () => void
}

function ItemThumb({ item, label }: { item: { id: string; imageUrl: string; name: string }; label: string }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <div
        style={{
          aspectRatio: '1',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'var(--cream)',
          border: '1px solid rgba(84,49,26,0.1)',
        }}
      >
        <img
          src={item.imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--brown-mid)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  )
}

export function OutfitCard({ outfit, onSave }: OutfitCardProps) {
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
    </div>
  )
}
