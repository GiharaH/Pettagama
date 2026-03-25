import { Link } from 'react-router-dom'
import { getWardrobe } from '@/lib/storage'
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

const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  outerwear: 'Outerwear',
  footwear: 'Footwear',
  accessories: 'Accessories',
}

export function Wardrobe() {
  const items = getWardrobe()

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((i) => CATEGORY_TO_GROUP[i.category] === group),
  }))

  return (
    <div className="page page--wardrobe page--wardrobe-flatlay">
      <BrandHeader eyebrow="Your closet" title="Wardrobe" tagline="Let your wardrobe think for you." />
      <div className="wardrobe-page-divider" aria-hidden />

      <div className="wardrobe-add-wrap">
        <Link to="/wardrobe/add" className="wardrobe-add-link">
          + Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="wardrobe-empty">
          <p className="wardrobe-empty__text">No items yet. Add your first piece to start getting outfit suggestions.</p>
          <Link to="/wardrobe/add" className="wardrobe-add-link wardrobe-add-link--primary">
            Add your first item
          </Link>
        </div>
      ) : (
        <div className="wardrobe-flatlay">
          {byGroup.map(({ group, items: groupItems }) =>
            groupItems.length > 0 ? (
              <section key={group} className="wardrobe-category-row" aria-label={GROUP_LABELS[group]}>
                <div className="wardrobe-category-meta">
                  <span className="wardrobe-category-label">{GROUP_LABELS[group]}</span>
                  <span className="wardrobe-category-count" aria-label={`${groupItems.length} items`}>
                    {groupItems.length}
                  </span>
                </div>
                <div className="wardrobe-category-strip">
                  {groupItems.map((item) => (
                    <FlatlayItem key={item.id} item={item} />
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

function FlatlayItem({ item }: { item: WardrobeItem }) {
  return (
    <Link to={`/wardrobe/edit/${item.id}`} className="wardrobe-flatlay-item">
      <img src={item.imageUrl} alt="" />
    </Link>
  )
}
