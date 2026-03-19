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
  if (tops.length === 0 || bottoms.length === 0) return outfits

  // Create up to `count` outfit combinations while allowing item reuse.
  // This guarantees users get 3 suggestions when the base wardrobe is small.
  for (let n = 0; n < count; n++) {
    const top = tops[n % tops.length]
    const bottom = bottoms[(n + Math.floor(n / Math.max(1, tops.length))) % bottoms.length]
    const out = needOuterwear && outerwear.length > 0 ? outerwear[n % outerwear.length] : undefined
    const shoe = footwear.length > 0 ? footwear[n % footwear.length] : undefined
    const acc = accessories.length > 0 ? [accessories[n % accessories.length]] : []

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
