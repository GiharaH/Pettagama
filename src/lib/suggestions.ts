import type { WardrobeItem, Outfit, Occasion, WeatherState } from '@/types'
import { outfitSignature } from '@/lib/outfitSignature'
import { generateOutfits as engineGenerateOutfits } from '@/lib/pettagama_outfit_engine'

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
  const top = items.find((i) => i.slot === 'top') as WardrobeItem | undefined
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
    const appOutfit = mapEngineOutfitToApp(engineOutfit as any, occasion)

    // Skip incomplete (engine should normally include both top+bottom)
    if (!appOutfit.top || !appOutfit.bottom) continue

    const sig = outfitSignature(appOutfit)
    if (exclude.has(sig)) continue
    if (used.has(sig)) continue

    used.add(sig)
    results.push(appOutfit)
    if (results.length >= count) break
  }

  return results
}
