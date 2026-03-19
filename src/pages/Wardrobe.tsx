import { Link } from 'react-router-dom'
import { getWardrobe } from '@/lib/storage'
import { CATEGORY_LABELS } from '@/lib/constants'
import { CATEGORY_TO_GROUP } from '@/types'
import type { WardrobeItem } from '@/types'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

const GROUP_ORDER: Array<'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories'> = [
  'tops',
  'bottoms',
  'outerwear',
  'footwear',
  'accessories',
]

export function Wardrobe() {
  const items = getWardrobe()

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((i) => CATEGORY_TO_GROUP[i.category] === group),
  }))

  return (
    <div className="page page--wardrobe">
      <BrandHeader eyebrow="Your closet" title="Wardrobe" tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      <Link to="/wardrobe/add" className="btn btn-primary btn-block" style={{ marginBottom: '1.5rem' }}>
        + Add item
      </Link>

      {items.length === 0 ? (
        <div className="card card-accent-teal-mid" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--black)' }}>No items yet. Add your first piece to start getting outfit suggestions.</p>
          <Link to="/wardrobe/add" className="btn btn-secondary">
            Add your first item
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {byGroup.map(({ group, items: groupItems }) =>
            groupItems.length > 0 ? (
              <section key={group} aria-label={group}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--teal-dark)', marginBottom: '0.75rem', textTransform: 'capitalize' }}>
                  {group}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                  {groupItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}

function ItemCard({ item }: { item: WardrobeItem }) {
  return (
    <Link
      to={`/wardrobe/edit/${item.id}`}
      className="card"
      style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
    >
      <div className="clothing-img-wrap" style={{ aspectRatio: '1' }}>
        <img src={item.imageUrl} alt={item.name} />
      </div>
      <div style={{ padding: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--brown-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name || CATEGORY_LABELS[item.category]}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--brown-mid)' }}>{CATEGORY_LABELS[item.category]}</div>
      </div>
    </Link>
  )
}
