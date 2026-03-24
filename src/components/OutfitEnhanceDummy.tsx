import type { Outfit } from '@/types'
import '@/styles/theme.css'

interface OutfitEnhanceDummyProps {
  outfit: Outfit
  /** Thumbnails for wardrobe “add” suggestions (shown on AFTER). */
  addImageUrls: string[]
  /** Three hex colours for the suggested palette row. */
  swatchColors: [string, string, string]
}

function SilhouetteBg() {
  return (
    <svg
      className="outfit-dummy__silhouette-svg"
      viewBox="0 0 100 188"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="50" cy="17" rx="11" ry="12" fill="var(--dummy-skin, #e8dcc8)" />
      <path
        d="M50 28c-8 0-14 5-15 12l-8 18c-2 5-1 11 2 15l6 8c2 3 5 5 9 5h12c4 0 7-2 9-5l6-8c3-4 4-10 2-15l-8-18c-1-7-7-12-15-12z"
        fill="var(--dummy-skin, #e8dcc8)"
      />
      <path
        d="M32 78l-4 22 6 68h12l4-38 4 38h12l6-68-4-22c-8 4-16 6-24 6s-16-2-24-6z"
        fill="var(--dummy-skin, #e8dcc8)"
      />
    </svg>
  )
}

function BodyPatches({ outfit }: { outfit: Outfit }) {
  return (
    <>
      {outfit.top && (
        <img
          src={outfit.top.imageUrl}
          alt=""
          className="outfit-dummy__patch outfit-dummy__patch--top"
        />
      )}
      {outfit.bottom && (
        <img
          src={outfit.bottom.imageUrl}
          alt=""
          className="outfit-dummy__patch outfit-dummy__patch--bottom"
        />
      )}
      {outfit.footwear && (
        <img
          src={outfit.footwear.imageUrl}
          alt=""
          className="outfit-dummy__patch outfit-dummy__patch--shoe"
        />
      )}
      {outfit.outerwear && (
        <img
          src={outfit.outerwear.imageUrl}
          alt=""
          className="outfit-dummy__patch outfit-dummy__patch--outer"
        />
      )}
    </>
  )
}

export function OutfitEnhanceDummy({ outfit, addImageUrls, swatchColors }: OutfitEnhanceDummyProps) {
  const extras = addImageUrls.slice(0, 3)

  return (
    <div className="outfit-enhance-dummy">
      <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)', fontWeight: 700, marginBottom: '0.65rem' }}>
        Enhance your look
      </div>

      <div className="outfit-enhance-dummy__row">
        <div className="outfit-dummy__column">
          <div className="outfit-dummy__label outfit-dummy__label--before">Before</div>
          <div className="outfit-dummy__canvas">
            <SilhouetteBg />
            <BodyPatches outfit={outfit} />
          </div>
        </div>

        <div className="outfit-dummy__column outfit-dummy__column--after">
          <div className="outfit-dummy__label outfit-dummy__label--after">After</div>
          <div className="outfit-dummy__frame-after">
            <div className="outfit-dummy__canvas">
              <SilhouetteBg />
              <BodyPatches outfit={outfit} />
              {extras.map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt=""
                  className={`outfit-dummy__patch outfit-dummy__patch--add outfit-dummy__patch--add${i}`}
                />
              ))}
              <div className="outfit-dummy__swatches" aria-label="Suggested colours">
                {swatchColors.map((hex, i) => (
                  <span key={`swatch-${i}`} className="outfit-dummy__swatch" style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>
          </div>
          <p className="outfit-dummy__after-note">*+ suggestions applied*</p>
        </div>
      </div>
    </div>
  )
}
