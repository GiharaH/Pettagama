import type { WardrobeItem, Outfit, Occasion, WeatherState } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'

export function suggestOutfits(
  wardrobe: WardrobeItem[],
  weather: WeatherState,
  occasion: Occasion,
  count: number = 3
): Outfit[] {
  const tops = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'tops')
  const bottoms = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'bottoms')
  const outerwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'outerwear')
  const footwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'footwear')
  const accessories = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'accessories')

  const needOuterwear = weather.tempBand === 'cold' || weather.tempBand === 'mild'
  const outfits: Outfit[] = []
  const used = new Set<string>()

  for (let n = 0; n < count && n < 20; n++) {
    const top = pickOne(tops, used)
    const bottom = pickOne(bottoms, used)
    if (!top || !bottom) break

    used.add(top.id)
    used.add(bottom.id)

    let out: WardrobeItem | undefined
    if (needOuterwear && outerwear.length > 0) {
      out = pickOne(outerwear, used)
      if (out) used.add(out.id)
    }

    const shoe = pickOne(footwear, used)
    if (shoe) used.add(shoe.id)

    const acc = accessories.length > 0 ? [pickOne(accessories, used)].filter(Boolean) as WardrobeItem[] : []

    outfits.push({
      id: `outfit-${Date.now()}-${n}-${Math.random().toString(36).slice(2, 8)}`,
      top,
      bottom,
      outerwear: out,
      footwear: shoe,
      accessories: acc,
      occasion,
      createdAt: new Date().toISOString(),
    })
  }

  return outfits
}

function pickOne<T extends { id: string }>(arr: T[], used: Set<string>): T | undefined {
  const available = arr.filter((x) => !used.has(x.id))
  if (available.length === 0) return undefined
  return available[Math.floor(Math.random() * available.length)]
}
