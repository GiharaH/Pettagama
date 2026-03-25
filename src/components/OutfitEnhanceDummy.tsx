import type { Outfit } from '@/types'
import '@/styles/theme.css'

interface OutfitEnhanceDummyProps {
  outfit: Outfit
  /** Thumbnails for wardrobe “add” suggestions (shown on AFTER). */
  addImageUrls: string[]
  /** Three hex colours for the suggested palette row. */
  swatchColors: [string, string, string]
}

/** Floating flat-lay cluster: no mannequin — pieces arranged on a cream surface. */
function FloatingCluster({ outfit }: { outfit: Outfit }) {
  const acc = outfit.accessories.slice(0, 2)

  return (
    <div className="outfit-flatlay__cluster">
      {outfit.outerwear && (
        <img
          src={outfit.outerwear.imageUrl}
          alt=""
          className="outfit-flatlay__img outfit-flatlay__slot outfit-flatlay__slot--outer"
        />
      )}
      <div className="outfit-flatlay__row">
        {outfit.top && (
          <img src={outfit.top.imageUrl} alt="" className="outfit-flatlay__img outfit-flatlay__slot outfit-flatlay__slot--top" />
        )}
        {outfit.bottom && (
          <img
            src={outfit.bottom.imageUrl}
            alt=""
            className="outfit-flatlay__img outfit-flatlay__slot outfit-flatlay__slot--bottom"
          />
        )}
      </div>
      <div className="outfit-flatlay__row outfit-flatlay__row--foot">
        {outfit.footwear && (
          <img
            src={outfit.footwear.imageUrl}
            alt=""
            className="outfit-flatlay__img outfit-flatlay__slot outfit-flatlay__slot--foot"
          />
        )}
        {acc.map((item) => (
          <img key={item.id} src={item.imageUrl} alt="" className="outfit-flatlay__img outfit-flatlay__slot outfit-flatlay__slot--acc" />
        ))}
      </div>
    </div>
  )
}

export function OutfitEnhanceDummy({ outfit, addImageUrls, swatchColors }: OutfitEnhanceDummyProps) {
  const extras = addImageUrls.slice(0, 3)

  return (
    <div className="outfit-enhance-dummy">
      <div className="outfit-enhance-dummy__row">
        <div className="outfit-flatlay__column" style={{ flex: '1 1 auto' }}>
          <div className="outfit-flatlay__board outfit-flatlay__board--after">
            <FloatingCluster outfit={outfit} />
            {extras.length > 0 && (
              <div className="outfit-flatlay__extras">
                {extras.map((url, i) => (
                  <img
                    key={`${url}-${i}`}
                    src={url}
                    alt=""
                    className={`outfit-flatlay__img outfit-flatlay__extra outfit-flatlay__extra--${i}`}
                  />
                ))}
              </div>
            )}
            <div className="outfit-flatlay__swatches" aria-label="Suggested colours">
              {swatchColors.map((hex, i) => (
                <span key={`swatch-${i}`} className="outfit-flatlay__swatch" style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
