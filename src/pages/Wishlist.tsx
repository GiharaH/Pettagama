import { useState } from 'react'
import { getWishlist, saveWishlist } from '@/lib/storage'
import type { WishlistItem } from '@/types'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>(getWishlist())

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    saveWishlist(next)
  }

  return (
    <div className="page page--wishlist">
      <BrandHeader eyebrow="Shopping inspiration" title="Wishlist" tagline="Items you might want to add to your wardrobe." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', background: '#fff' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--brown-dark)' }}>
            Your wishlist is empty. Generate outfits on the Home page to see “Improve this outfit” suggestions you can act on.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                background: '#fff',
              }}
            >
              {item.imageUrl && (
                <div style={{ width: 72, height: 90, flexShrink: 0, background: '#fff', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(84,49,26,0.12)' }}>
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)', fontWeight: 600 }}>
                  {item.title}
                </div>
                {item.note && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--brown-mid)', marginTop: '0.25rem' }}>
                    {item.note}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ color: 'var(--brown-mid)', fontSize: '0.85rem' }}
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from wishlist`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
