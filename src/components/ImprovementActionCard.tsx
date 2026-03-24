import type { ImprovementAction } from '@/lib/outfitImprovements'
import { inspirationImageForSuggestion } from '@/lib/inspirationImages'
import { wishlistKeyForAction } from '@/lib/wishlistKeys'
import '@/styles/theme.css'

function effectiveWishlistKey(a: ImprovementAction): string {
  return a.wishlistKey ?? wishlistKeyForAction(a.source, a.type, a.item, a.search_query)
}

export function ImprovementActionCard({
  action,
  inWishlist,
  onAddWishlist,
}: {
  action: ImprovementAction
  inWishlist: boolean
  onAddWishlist: () => void
}) {
  const src =
    action.imageUrl ||
    action.inspirationImageUrl ||
    inspirationImageForSuggestion(action.search_query, action.colourGroup)

  const kind = action.type === 'add' ? 'Add' : 'Swap'
  const tag = action.source === 'missing' ? 'Inspired' : 'Yours'

  return (
    <div className="improve-action-card">
      <div className="improve-action-card__img">
        <img src={src} alt="" loading="lazy" />
      </div>
      <div className="improve-action-card__body">
        <div className="improve-action-card__meta">
          <span className="improve-action-card__kind">{kind}</span>
          <span className="improve-action-card__tag">{tag}</span>
        </div>
        <div className="improve-action-card__title">{action.item}</div>
        <div className="improve-action-card__actions">
          <button
            type="button"
            className={`improve-action-card__wishlist ${inWishlist ? 'is-saved' : ''}`}
            onClick={onAddWishlist}
            disabled={inWishlist}
            aria-pressed={inWishlist}
            aria-label={inWishlist ? 'Saved to wishlist' : 'Add to wishlist'}
          >
            <span className="improve-action-card__wishlist-icon" aria-hidden>
              {inWishlist ? '✓' : '+'}
            </span>
            <span>{inWishlist ? 'Marked' : 'Wishlist'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { effectiveWishlistKey }
