import type { WardrobeItem, Outfit, Occasion, WeatherState } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'
import { outfitSignature } from '@/lib/outfitSignature'
import { generateOutfits as engineGenerateOutfits } from '@/lib/pettagama_outfit_engine'
import { inferNecklineTypeForTop } from '@/lib/necklineInference'

export interface SuggestOutfitsOptions {
  /** Wardrobe item id combinations to avoid (e.g. shown in the last 7 days). */
  excludeSignatures?: Set<string>
}

const MAX_ENGINE_MULTIPLIER = 5

function mapEngineOutfitToApp(
  engineOutfit: { items: AnyItem[] },
  occasion: Occasion
): Outfit {
  const items = engineOutfit.items ?? []
  const rawTop = items.find((i) => i.slot === 'top') as WardrobeItem | undefined
  const top = rawTop
    ? { ...rawTop, necklineType: rawTop.necklineType ?? inferNecklineTypeForTop(rawTop) }
    : undefined
  const bottom = items.find((i) => i.slot === 'bottom') as WardrobeItem | undefined
  const outerwear = items.find((i) => i.slot === 'outerwear') as WardrobeItem | undefined
  const footwear = items.find((i) => i.slot === 'footwear') as WardrobeItem | undefined

  const accessorySlots = new Set(['accessory', 'bag', 'jewellery'])
  const accessories = items
    .filter((i): i is AnyItem & { slot: string } => typeof i.slot === 'string' && accessorySlots.has(i.slot))
    .map((i) => i as unknown as WardrobeItem)

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

type AnyItem = WardrobeItem & { slot?: string; id?: string; category?: string }

function wardrobeHasFootwear(wardrobe: WardrobeItem[]) {
  return wardrobe.some((i) => CATEGORY_TO_GROUP[i.category] === 'footwear')
}

function wardrobeHasAccessory(wardrobe: WardrobeItem[]) {
  return wardrobe.some((i) => CATEGORY_TO_GROUP[i.category] === 'accessories')
}

/** Ensure shoe + at least one accessory when the closet has them (engine may rarely omit). */
function fillMissingOutfitPieces(wardrobe: WardrobeItem[], outfit: Outfit): Outfit {
  const used = new Set<string>()
  const mark = (item?: WardrobeItem | null) => {
    if (item?.id) used.add(item.id)
  }
  mark(outfit.top)
  mark(outfit.bottom)
  mark(outfit.outerwear)
  mark(outfit.footwear)
  outfit.accessories.forEach(mark)

  let footwear = outfit.footwear
  if (!footwear && wardrobeHasFootwear(wardrobe)) {
    const pool = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'footwear' && !used.has(i.id))
    if (pool.length) {
      footwear = pool[Math.floor(Math.random() * pool.length)]!
      used.add(footwear.id)
    }
  }

  let accessories = [...outfit.accessories]
  if (accessories.length === 0 && wardrobeHasAccessory(wardrobe)) {
    const pool = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'accessories' && !used.has(i.id))
    if (pool.length) {
      const pick = pool[Math.floor(Math.random() * pool.length)]!
      accessories = [pick]
    }
  }

  return { ...outfit, footwear, accessories }
}

export function suggestOutfits(
  wardrobe: WardrobeItem[],
  weather: WeatherState,
  occasion: Occasion,
  count: number = 3,
  options?: SuggestOutfitsOptions
): Outfit[] {
  const exclude = options?.excludeSignatures ?? new Set<string>()
  const results: Outfit[] = []
  const used = new Set<string>()

  const maxToGenerate = Math.max(3, count * MAX_ENGINE_MULTIPLIER)
  const engineOutfits = engineGenerateOutfits(wardrobe as unknown as AnyItem[], weather as unknown as AnyItem, occasion, maxToGenerate)

  for (const engineOutfit of engineOutfits) {
    let appOutfit = mapEngineOutfitToApp(engineOutfit as any, occasion)
    appOutfit = fillMissingOutfitPieces(wardrobe, appOutfit)

    if (!appOutfit.top || !appOutfit.bottom) continue
    if (wardrobeHasFootwear(wardrobe) && !appOutfit.footwear) continue
    if (wardrobeHasAccessory(wardrobe) && appOutfit.accessories.length === 0) continue

    const sig = outfitSignature(appOutfit)
    if (exclude.has(sig)) continue
    if (used.has(sig)) continue

    used.add(sig)
    results.push(appOutfit)
    if (results.length >= count) break
  }

  return results
}
