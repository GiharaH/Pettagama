import type { CapsuleSavedEntry, Outfit, WardrobeItem } from '@/types'
import { OCCASIONS } from '@/lib/constants'
import { COLOUR_GROUP_HEX } from '@/lib/capsules'
import { GarmentCutoutImage } from '@/components/GarmentCutoutImage'
import '@/styles/theme.css'

const CARD_BACKGROUNDS = ['#54311A', '#260701', '#035e7b'] as const

function occasionPillLabel(value: string): string {
  const found = OCCASIONS.find((o) => o.value === value)
  if (found) return found.label
  return value.replace(/_/g, ' ')
}

function allItems(outfit: Outfit): WardrobeItem[] {
  const list: WardrobeItem[] = []
  if (outfit.top) list.push(outfit.top)
  if (outfit.bottom) list.push(outfit.bottom)
  if (outfit.outerwear) list.push(outfit.outerwear)
  if (outfit.footwear) list.push(outfit.footwear)
  list.push(...outfit.accessories)
  return list
}

function fixOutfitName(outfit: Outfit): string {
  const names = [outfit.top?.name, outfit.bottom?.name, outfit.outerwear?.name].filter(Boolean) as string[]
  const primary = names[0] ?? outfit.footwear?.name ?? outfit.accessories[0]?.name
  if (primary) {
    const second = names[1]
    if (second && second !== primary) {
      const combined = `${primary} · ${second}`
      return combined.length > 42 ? `${combined.slice(0, 39)}…` : combined
    }
    return primary.length > 44 ? `${primary.slice(0, 41)}…` : primary
  }
  return 'Saved look'
}

function occasionPills(outfit: Outfit): string[] {
  const labels: string[] = []
  const seen = new Set<string>()
  const push = (raw: string) => {
    const label = occasionPillLabel(raw)
    const k = label.toLowerCase()
    if (seen.has(k)) return
    seen.add(k)
    labels.push(label)
  }
  push(String(outfit.occasion))
  for (const item of allItems(outfit)) {
    for (const t of item.occasionTags ?? []) {
      push(String(t))
    }
  }
  return labels.slice(0, 6)
}

/** Unique colour-group dots in stable order (max 6). */
function colourDots(outfit: Outfit): string[] {
  const seen = new Set<string>()
  const hexes: string[] = []
  for (const item of allItems(outfit)) {
    const hex = COLOUR_GROUP_HEX[item.colourGroup]
    if (!seen.has(hex)) {
      seen.add(hex)
      hexes.push(hex)
    }
    if (hexes.length >= 6) break
  }
  return hexes
}

function splitAccessories(outfit: Outfit): { bag?: WardrobeItem; jewellery?: WardrobeItem } {
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

export function CapsuleFlatLayOutfitCard({
  entry,
  variantIndex,
}: {
  entry: CapsuleSavedEntry
  variantIndex: number
}) {
  const { outfit, harmonyScore } = entry
  const bg = CARD_BACKGROUNDS[variantIndex % CARD_BACKGROUNDS.length]
  const { bag, jewellery } = splitAccessories(outfit)
  const pills = occasionPills(outfit)
  const dots = colourDots(outfit)
  const name = fixOutfitName(outfit)

  return (
    <article className="capsule-flatlay-card" style={{ backgroundColor: bg }} aria-label={name}>
      <div className="capsule-flatlay-card__canvas" aria-hidden>
        {outfit.bottom && (
          <GarmentCutoutImage
            src={outfit.bottom.imageUrl}
            alt=""
            className="capsule-flatlay-card__piece capsule-flatlay-card__piece--bottom"
          />
        )}
        {outfit.outerwear && (
          <GarmentCutoutImage
            src={outfit.outerwear.imageUrl}
            alt=""
            className="capsule-flatlay-card__piece capsule-flatlay-card__piece--outer"
          />
        )}
        {outfit.top && (
          <GarmentCutoutImage
            src={outfit.top.imageUrl}
            alt=""
            className="capsule-flatlay-card__piece capsule-flatlay-card__piece--top"
          />
        )}
        {outfit.footwear && (
          <GarmentCutoutImage
            src={outfit.footwear.imageUrl}
            alt=""
            className="capsule-flatlay-card__piece capsule-flatlay-card__piece--shoe"
          />
        )}
        {bag && (
          <GarmentCutoutImage src={bag.imageUrl} alt="" className="capsule-flatlay-card__piece capsule-flatlay-card__piece--bag" />
        )}
        {jewellery && (
          <GarmentCutoutImage
            src={jewellery.imageUrl}
            alt=""
            className="capsule-flatlay-card__piece capsule-flatlay-card__piece--jewel"
          />
        )}
      </div>

      <div className="capsule-flatlay-card__footer">
        <h3 className="capsule-flatlay-card__name">{name}</h3>
        <div className="capsule-flatlay-card__pills">
          {pills.map((label) => (
            <span key={label} className="capsule-flatlay-card__pill">
              {label}
            </span>
          ))}
        </div>
        <div className="capsule-flatlay-card__row">
          <div className="capsule-flatlay-card__dots">
            {dots.map((hex) => (
              <span key={hex} className="capsule-flatlay-card__dot" style={{ backgroundColor: hex }} />
            ))}
          </div>
          {harmonyScore != null && (
            <span className="capsule-flatlay-card__harmony-badge" title="Design Room score when saved">
              {harmonyScore}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
