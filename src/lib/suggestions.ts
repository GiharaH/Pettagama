import type { WardrobeItem, Outfit, Occasion, WeatherState } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'
import { outfitSignature } from '@/lib/outfitSignature'

export interface SuggestOutfitsOptions {
  /** Wardrobe item id combinations to avoid (e.g. shown in the last 7 days). */
  excludeSignatures?: Set<string>
}

const MAX_TRIES = 1200

function buildOutfit(
  occasion: Occasion,
  top: WardrobeItem,
  bottom: WardrobeItem,
  outerwear: WardrobeItem | undefined,
  footwear: WardrobeItem | undefined,
  accessories: WardrobeItem[]
): Outfit {
  return {
    id: `outfit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    top,
    bottom,
    outerwear,
    footwear,
    accessories,
    occasion,
    createdAt: new Date().toISOString(),
  }
}

export function suggestOutfits(
  wardrobe: WardrobeItem[],
  weather: WeatherState,
  occasion: Occasion,
  count: number = 3,
  options?: SuggestOutfitsOptions
): Outfit[] {
  const tops = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'tops')
  const bottoms = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'bottoms')
  const outerwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'outerwear')
  const footwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'footwear')
  const accessories = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'accessories')

  const needOuterwear = weather.tempBand === 'cold' || weather.tempBand === 'mild'
  const exclude = options?.excludeSignatures ?? new Set<string>()
  const outfits: Outfit[] = []
  const batchUsed = new Set<string>()

  if (tops.length === 0 || bottoms.length === 0) return outfits

  const daySeed = Math.floor(Date.now() / 86400000) % 9973

  const tryAdd = (
    top: WardrobeItem,
    bottom: WardrobeItem,
    out: WardrobeItem | undefined,
    shoe: WardrobeItem | undefined,
    acc: WardrobeItem[]
  ): boolean => {
    const o = buildOutfit(occasion, top, bottom, out, shoe, acc)
    const sig = outfitSignature(o)
    if (batchUsed.has(sig)) return false
    if (exclude.has(sig)) return false
    batchUsed.add(sig)
    outfits.push(o)
    return true
  }

  const pickIndices = (attempt: number) => {
    const ti = (daySeed + attempt * 3) % tops.length
    const bi = (daySeed + attempt * 5 + 1) % bottoms.length
    const oi = (daySeed + attempt * 2) % Math.max(outerwear.length, 1)
    const fi = (daySeed + attempt * 7) % Math.max(footwear.length, 1)
    const ai = (daySeed + attempt) % Math.max(accessories.length, 1)
    return { ti, bi, oi, fi, ai }
  }

  // Unique combos only; avoid recent (7-day) signatures and duplicates in this batch.
  // May return fewer than `count` if the wardrobe cannot produce more distinct looks yet.
  for (let attempt = 0; attempt < MAX_TRIES && outfits.length < count; attempt++) {
    const { ti, bi, oi, fi, ai } = pickIndices(attempt)
    const top = tops[ti]
    const bottom = bottoms[bi]
    const out = needOuterwear && outerwear.length > 0 ? outerwear[oi % outerwear.length] : undefined
    const shoe = footwear.length > 0 ? footwear[fi % footwear.length] : undefined
    const acc = accessories.length > 0 ? [accessories[ai % accessories.length]] : []
    tryAdd(top, bottom, out, shoe, acc)
  }

  return outfits.slice(0, count)
}
