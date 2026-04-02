// ================================================================
// PETTAGAMA — OUTFIT GENERATION ENGINE (app-adapted)
// ================================================================
// This file is based on the engine you provided, but adjusted to
// work with Pettagama's runtime data shapes:
// - Home already passes a processed `WeatherState` (tempBand/condition),
//   not raw OpenWeatherMap JSON.
// - Pettagama wardrobe categories use `snake_case` names like `t_shirt`,
//   so weather rule category lists are aligned accordingly.
// - UI suggestion generation only needs `generateOutfits`; improvement
//   suggestions are exported as `getOutfitImprovements` but are not wired
//   into the UI here.
// ================================================================

import { CATEGORY_TO_GROUP, type WardrobeCategory } from '@/types'

type AnyRecord = Record<string, any>

/** Normalize category strings from storage (spaces/hyphens → snake_case). */
function normalizeCategory(cat: unknown) {
  return String(cat ?? '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function categoryGroup(cat: string): 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories' | null {
  const k = normalizeCategory(cat)
  if (!(k in CATEGORY_TO_GROUP)) return null
  return CATEGORY_TO_GROUP[k as WardrobeCategory]
}

// ────────────────────────────────────────────────────────────────
// SECTION 1 — WEATHER PROFILE BUILDER
// ────────────────────────────────────────────────────────────────

function isPettagamaWeatherState(x: unknown): x is { tempBand: string; condition: string } {
  if (!x || typeof x !== 'object') return false
  const obj = x as AnyRecord
  return typeof obj.tempBand === 'string' && typeof obj.condition === 'string'
}

export function buildWeatherProfile(apiData: AnyRecord | null = null) {
  if (!apiData) {
    return {
      tempBand: 'NEUTRAL' as const,
      isRainy: false,
      isWindy: false,
      isHumid: false,
      isCold: false,
      isHot: false,
    }
  }

  // Pettagama app passes WeatherState already processed.
  if (isPettagamaWeatherState(apiData)) {
    const tempBandRaw = String(apiData.tempBand).toLowerCase()
    const tempBand =
      tempBandRaw === 'cold'
        ? 'COLD'
        : tempBandRaw === 'mild'
          ? 'COOL' // map mild -> COOL so outerwear logic matches app behavior
          : tempBandRaw === 'warm'
            ? 'WARM'
            : tempBandRaw === 'hot'
              ? 'HOT'
              : 'NEUTRAL'

    const condition = String(apiData.condition).toLowerCase()
    const isRainy = condition === 'rain' || condition === 'snow'
    const isWindy = condition === 'wind'

    return {
      tempBand: tempBand as any,
      isRainy,
      isWindy,
      isHumid: false,
      isCold: ['COLD', 'COOL'].includes(tempBand),
      isHot: ['WARM', 'HOT'].includes(tempBand),
    }
  }

  // Fallback for raw OpenWeatherMap-like JSON.
  const temp = apiData.main?.temp ?? apiData.temperature ?? 22
  const humidity = apiData.main?.humidity ?? apiData.humidity ?? 50
  const windSpeed = apiData.wind?.speed ?? apiData.windSpeed ?? 0
  const weatherId = apiData.weather?.[0]?.id ?? 0
  const weatherMain = apiData.weather?.[0]?.main ?? ''

  const isRainy =
    (weatherId >= 200 && weatherId < 700) || ['Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Sleet'].includes(weatherMain)

  const tempBand = temp < 10 ? 'COLD' : temp < 17 ? 'COOL' : temp < 24 ? 'MILD' : temp < 30 ? 'WARM' : 'HOT'

  return {
    tempBand,
    isRainy,
    isWindy: windSpeed > 7,
    isHumid: humidity > 75,
    isCold: ['COLD', 'COOL'].includes(tempBand),
    isHot: ['WARM', 'HOT'].includes(tempBand),
  }
}

// ────────────────────────────────────────────────────────────────
// SECTION 2 — WEATHER COMPATIBILITY HARD RULES
// ────────────────────────────────────────────────────────────────

// Pettagama categories (snake_case) are the source of truth.
const WARM_GARMENTS = ['jacket', 'coat', 'blazer', 'dupatta_stole', 'sweater', 'hoodie', 'long_sleeve', 'belt_scarf', 'boots', 'knee_boots']
const COLD_GARMENTS = ['sandals_flats', 'traditional']
const RAIN_UNSAFE_SHOES = ['sandals_flats', 'traditional', 'heels']
const RAIN_SAFE_SHOES = ['boots', 'sneakers']

export function passesWeatherRules(outfit: { items: AnyRecord[] }, weather: ReturnType<typeof buildWeatherProfile>) {
  if (weather.tempBand === 'NEUTRAL') return true // no weather data — allow all

  const categories = outfit.items.map((i) => String(i.category ?? '').toLowerCase().replace(' ', '_'))

  const hasWarmGarment = categories.some((c) => WARM_GARMENTS.includes(c))
  const hasColdGarment = categories.some((c) => COLD_GARMENTS.includes(c))
  const hasRainUnsafeShoe = categories.some((c) => RAIN_UNSAFE_SHOES.includes(c))
  const hasRainSafeShoe = categories.some((c) => RAIN_SAFE_SHOES.includes(c))

  // 🚫 HARD RULE 1 — No sandals/shorts/sleeveless in cold weather
  if (weather.isCold && hasColdGarment) return false

  // 🚫 HARD RULE 2 — No heavy coats/scarves/boots when it's HOT
  if (weather.tempBand === 'HOT' && hasWarmGarment) {
    // Blazers are acceptable in warm weather (office), coats/scarves are not.
    const heavyWarmItems = ['coat', 'jacket', 'blazer', 'dupatta_stole', 'puffer', 'belt_scarf', 'boots']
    const hasHeavyItem = categories.some((c) => heavyWarmItems.includes(c))
    if (hasHeavyItem) return false
  }

  // 🚫 HARD RULE 3 — No suede or open-toe shoes in rain
  if (weather.isRainy && hasRainUnsafeShoe && !hasRainSafeShoe) return false

  // 🚫 HARD RULE 4 — Mixed season items in same outfit
  if (hasWarmGarment && hasColdGarment) {
    const heavyColdItems = ['coat', 'puffer', 'jacket', 'belt_scarf', 'boots']
    const isHeavyMix = categories.some((c) => heavyColdItems.includes(c)) && categories.some((c) => COLD_GARMENTS.includes(c))
    if (isHeavyMix) return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────
// SECTION 3 — COLOUR HARMONY ENGINE (dominantHex if available)
// ────────────────────────────────────────────────────────────────

function hexToHsl(hex: string) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0,
    s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function isNeutral(hsl: { h: number; s: number; l: number }) {
  // Low saturation = neutral (white, black, grey, beige, navy)
  return hsl.s < 18 || hsl.l < 12 || hsl.l > 88
}

function hueDiff(h1: number, h2: number) {
  const diff = Math.abs(h1 - h2)
  return diff > 180 ? 360 - diff : diff
}

export function scoreColourHarmony(items: AnyRecord[]) {
  const colours = items
    .map((i) => {
      const hex = (i.dominantHex ?? i.dominantColour) as string | undefined
      if (!hex) return null
      return { ...hexToHsl(hex), hex, name: i.name as string }
    })
    .filter((x): x is { h: number; s: number; l: number; hex: string; name: string } => Boolean(x))

  if (colours.length < 2) return { score: 70, harmonyType: 'Insufficient data', grade: 'B' }

  const nonNeutrals = colours.filter((c) => !isNeutral(c))
  const neutralCount = colours.length - nonNeutrals.length

  if (nonNeutrals.length === 0) {
    return { score: 85, harmonyType: 'Tonal / Monochrome', grade: 'A' }
  }

  if (nonNeutrals.length === 1) {
    return { score: 90, harmonyType: 'Neutral + one accent', grade: 'A' }
  }

  const hues = nonNeutrals.map((c) => c.h)

  const hueSpread = Math.max(...hues.map((h) => hueDiff(h, hues[0])))
  if (hueSpread < 25) {
    const score = 80 + Math.round((1 - hueSpread / 25) * 15)
    return { score, harmonyType: 'Monochromatic', grade: score >= 90 ? 'A' : 'B' }
  }

  if (hueSpread < 50) {
    return { score: 82, harmonyType: 'Analogous', grade: 'A' }
  }

  if (nonNeutrals.length === 2) {
    const diff = hueDiff(hues[0], hues[1])
    if (diff >= 150 && diff <= 210) {
      return { score: 88, harmonyType: 'Complementary', grade: 'A' }
    }
    if (diff >= 120 && diff <= 150) {
      return { score: 78, harmonyType: 'Split complementary', grade: 'B+' }
    }
  }

  if (nonNeutrals.length === 3) {
    const sorted = [...hues].sort((a, b) => a - b)
    const d1 = hueDiff(sorted[0], sorted[1])
    const d2 = hueDiff(sorted[1], sorted[2])
    if (Math.abs(d1 - 120) < 30 && Math.abs(d2 - 120) < 30) {
      return { score: 75, harmonyType: 'Triadic', grade: 'B' }
    }
  }

  if (nonNeutrals.length <= 3 && neutralCount >= 1) {
    return { score: 72, harmonyType: '60-30-10', grade: 'B' }
  }

  if (nonNeutrals.length > 3 && hueSpread > 100) {
    return { score: 35, harmonyType: 'Clashing — too many colours', grade: 'D' }
  }

  return { score: 55, harmonyType: 'Mixed — low harmony', grade: 'C' }
}

// ────────────────────────────────────────────────────────────────
// SECTION 4 — OCCASION WEIGHTING
// ────────────────────────────────────────────────────────────────

const OCCASION_WEIGHTS: Record<string, Record<string, number>> = {
  casual: { casual: 1.0, office: 0.5, party: 0.3, traditional: 0.1, wedding: 0.1, travel: 0.8, active: 0.5 },
  office: { casual: 0.4, office: 1.0, party: 0.3, traditional: 0.2, wedding: 0.4, travel: 0.3, active: 0.0 },
  party: { casual: 0.3, office: 0.2, party: 1.0, traditional: 0.5, wedding: 0.6, travel: 0.2, active: 0.0 },
  traditional: { casual: 0.1, office: 0.3, party: 0.5, traditional: 1.0, wedding: 0.8, travel: 0.1, active: 0.0 },
  wedding: { casual: 0.0, office: 0.2, party: 0.6, traditional: 0.8, wedding: 1.0, travel: 0.0, active: 0.0 },
  travel: { casual: 0.8, office: 0.3, party: 0.1, traditional: 0.1, wedding: 0.0, travel: 1.0, active: 0.6 },
  active: { casual: 0.4, office: 0.0, party: 0.0, traditional: 0.0, wedding: 0.0, travel: 0.5, active: 1.0 },
}

export function scoreOccasionFit(item: AnyRecord, targetOccasion: string) {
  const occasion = targetOccasion?.toLowerCase() ?? 'casual'
  const weights = OCCASION_WEIGHTS[occasion] ?? OCCASION_WEIGHTS.casual
  const tags = item.occasionTags ?? ['casual']
  const best = Math.max(...tags.map((tag: string) => weights[String(tag)] ?? 0.3))
  return best
}

// ────────────────────────────────────────────────────────────────
// SECTION 5 — OUTFIT ASSEMBLER
// ────────────────────────────────────────────────────────────────

const MANDATORY_SLOTS = ['top', 'bottom'] as const

function pickBestItemPerSlot(items: AnyRecord[], slot: string, occasion: string) {
  const candidates = items.filter((i) => {
    const cat = normalizeCategory(i.category)
    if (!cat) return false
    const g = categoryGroup(cat)

    if (slot === 'top') return g === 'tops'
    if (slot === 'bottom') return g === 'bottoms'
    if (slot === 'footwear') return g === 'footwear'
    if (slot === 'outerwear') return g === 'outerwear'
    if (slot === 'bag') return cat === 'bag_clutch'
    if (slot === 'jewellery') return ['necklace', 'earrings_rings', 'bangles_bracelets'].includes(cat)
    if (slot === 'accessory') return cat === 'belt_scarf'
    return false
  })

  if (!candidates.length) return null

  const scored = candidates
    .map((item) => ({ item, score: scoreOccasionFit(item, occasion) }))
    .sort((a, b) => b.score - a.score)

  const topN = scored.slice(0, Math.min(3, scored.length))
  return topN[Math.floor(Math.random() * topN.length)].item
}

function shouldAddOuterwear(weather: ReturnType<typeof buildWeatherProfile>) {
  if (!weather) return false
  return ['COLD', 'COOL'].includes(weather.tempBand) || weather.isWindy
}

function shouldExcludeOuterwear(weather: ReturnType<typeof buildWeatherProfile>) {
  if (!weather || weather.tempBand === 'NEUTRAL') return false
  return weather.tempBand === 'HOT'
}

function assembleOutfitCandidate(wardrobe: AnyRecord[], occasion: string, weather: ReturnType<typeof buildWeatherProfile>) {
  const outfit: { items: AnyRecord[] } = { items: [] }

  for (const slot of MANDATORY_SLOTS) {
    const item = pickBestItemPerSlot(wardrobe, slot, occasion)
    if (item) outfit.items.push({ ...item, slot })
  }

  const shoe = pickBestItemPerSlot(wardrobe, 'footwear', occasion)
  if (shoe) outfit.items.push({ ...shoe, slot: 'footwear' })

  if (shouldAddOuterwear(weather) && !shouldExcludeOuterwear(weather)) {
    const layer = pickBestItemPerSlot(wardrobe, 'outerwear', occasion)
    if (layer) outfit.items.push({ ...layer, slot: 'outerwear' })
  }

  if (occasion !== 'active') {
    const bag = pickBestItemPerSlot(wardrobe, 'bag', occasion)
    if (bag) outfit.items.push({ ...bag, slot: 'bag' })
  }

  if (['party', 'traditional', 'wedding', 'office'].includes(String(occasion).toLowerCase())) {
    const jewel = pickBestItemPerSlot(wardrobe, 'jewellery', occasion)
    if (jewel) outfit.items.push({ ...jewel, slot: 'jewellery' })
  }

  return outfit
}

function firstItemInGroup(items: AnyRecord[], group: 'tops' | 'bottoms'): AnyRecord | null {
  for (const i of items) {
    const g = categoryGroup(normalizeCategory(i.category))
    if (g === group) return i
  }
  return null
}

// ────────────────────────────────────────────────────────────────
// SECTION 6 — OUTFIT SCORER
// ────────────────────────────────────────────────────────────────

export function scoreOutfit(outfit: { items: AnyRecord[] }, occasion: string) {
  const colourResult = scoreColourHarmony(outfit.items)
  const colourScore = colourResult.score * 0.5

  const occasionScores = outfit.items.map((i) => scoreOccasionFit(i, occasion))
  const avgOccasion = occasionScores.reduce((a, b) => a + b, 0) / Math.max(occasionScores.length, 1)
  const occasionScore = avgOccasion * 100 * 0.35

  const hasTop = outfit.items.some((i) => i.slot === 'top')
  const hasBottom = outfit.items.some((i) => i.slot === 'bottom')
  const hasFootwear = outfit.items.some((i) => i.slot === 'footwear')
  const hasExtra = outfit.items.some((i) => ['outerwear', 'bag', 'jewellery', 'accessory'].includes(i.slot))
  const completeness = ((hasTop ? 1 : 0) + (hasBottom ? 1 : 0) + (hasFootwear ? 1 : 0) + (hasExtra ? 1 : 0)) / 4
  const completenessScore = completeness * 100 * 0.15

  const total = Math.round(colourScore + occasionScore + completenessScore)

  return {
    total,
    colourResult,
    grade: total >= 85 ? 'A' : total >= 75 ? 'B+' : total >= 65 ? 'B' : total >= 55 ? 'C' : 'D',
  }
}

// ────────────────────────────────────────────────────────────────
// SECTION 7 — MAIN EXPORT FUNCTION
// ────────────────────────────────────────────────────────────────

export function generateOutfits(userWardrobe: AnyRecord[], weatherData: AnyRecord | null, occasion = 'casual', count = 3) {
  if (!userWardrobe?.length) {
    console.warn('Pettagama: wardrobe is empty — cannot generate outfits')
    return []
  }

  const weather = buildWeatherProfile(weatherData)
  const MAX_ATTEMPTS = Math.max(count * 20, 80)
  const candidates: any[] = []
  /** Valid top+bottom + weather, but total score under 55 */
  const belowThreshold: any[] = []
  const seenKeys = new Set<string>()

  const pushScored = (outfit: { items: AnyRecord[] }, scoreResult: ReturnType<typeof scoreOutfit>, pool: 'high' | 'low') => {
    const row = {
      ...outfit,
      score: scoreResult.total,
      grade: scoreResult.grade,
      harmonyType: scoreResult.colourResult.harmonyType,
      weather: weather.tempBand,
      occasion,
    }
    if (pool === 'high') candidates.push(row)
    else belowThreshold.push(row)
  }

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const outfit = assembleOutfitCandidate(userWardrobe, occasion, weather)

    const hasTop = outfit.items.some((it) => it.slot === 'top')
    const hasBottom = outfit.items.some((it) => it.slot === 'bottom')
    if (!hasTop || !hasBottom) continue

    if (!passesWeatherRules(outfit, weather)) continue

    const key = outfit.items
      .filter((it) => ['top', 'bottom'].includes(it.slot))
      .map((it) => String(it.id ?? ''))
      .sort()
      .join('|')

    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    const scoreResult = scoreOutfit(outfit, occasion)
    if (scoreResult.total >= 55) {
      pushScored(outfit, scoreResult, 'high')
    } else {
      pushScored(outfit, scoreResult, 'low')
    }
  }

  const primary = candidates.length ? candidates : belowThreshold

  if (primary.length) {
    return primary.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, count)
  }

  // Last resort: one deterministic top + bottom if the wardrobe has both groups but random assembly failed.
  const top = firstItemInGroup(userWardrobe, 'tops')
  const bottom = firstItemInGroup(userWardrobe, 'bottoms')
  if (top && bottom) {
    const outfit = { items: [{ ...top, slot: 'top' }, { ...bottom, slot: 'bottom' }] }
    const scoreResult = scoreOutfit(outfit, occasion)
    return [
      {
        ...outfit,
        score: scoreResult.total,
        grade: scoreResult.grade,
        harmonyType: scoreResult.colourResult.harmonyType,
        weather: weather.tempBand,
        occasion,
      },
    ]
  }

  console.warn('Pettagama: could not assemble an outfit — need at least one top and one bottom in wardrobe')
  return []
}

// ────────────────────────────────────────────────────────────────
// SECTION 8 — IMPROVE THIS OUTFIT (exported, not wired into UI)
// ────────────────────────────────────────────────────────────────

export function getOutfitImprovements(outfit: { items: AnyRecord[] }, occasion: string, weather: AnyRecord | null) {
  const suggestions: any[] = []
  const slots = outfit.items.map((i) => i.slot)

  const colourResult = scoreColourHarmony(outfit.items)

  if (!slots.includes('footwear')) {
    suggestions.push({
      type: 'missing',
      slot: 'footwear',
      message: 'Add shoes to complete this outfit',
    })
  }

  const w = buildWeatherProfile(weather)
  if (!slots.includes('outerwear') && shouldAddOuterwear(w)) {
    suggestions.push({
      type: 'weather',
      slot: 'outerwear',
      message: "It's cool today — a layer would help",
    })
  }

  if (colourResult.score < 65) {
    suggestions.push({
      type: 'colour',
      slot: null,
      message: `Colour harmony is ${colourResult.grade} (${colourResult.harmonyType})`,
    })
  }

  if (['party', 'traditional', 'wedding', 'office'].includes(String(occasion).toLowerCase()) && !slots.includes('jewellery')) {
    suggestions.push({
      type: 'missing',
      slot: 'jewellery',
      message: 'Accessories would elevate this outfit for the occasion',
    })
  }

  if (!slots.includes('bag') && occasion !== 'active') {
    suggestions.push({
      type: 'missing',
      slot: 'bag',
      message: 'A bag would complete this look',
    })
  }

  return suggestions
}

