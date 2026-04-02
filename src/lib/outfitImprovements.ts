import type { ColourGroup, Occasion, Outfit, WeatherState, WardrobeItem } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import { CATEGORY_TO_GROUP } from '@/types'
import { inspirationImageForSuggestion } from '@/lib/inspirationImages'
import { wishlistKeyForAction } from '@/lib/wishlistKeys'

export type ImprovementSource = 'wardrobe' | 'missing'
export type ImprovementActionType = 'add' | 'swap'

export interface ImprovementAction {
  type: ImprovementActionType
  item: string
  source: ImprovementSource
  reason: string
  search_query: string
  /** Wardrobe item thumbnail when source is wardrobe (for before/after visuals). */
  imageUrl?: string
  /** Colour palette for suggested “add” swatches. */
  colourGroup?: ColourGroup
  /** Stable key for wishlist row (see `wishlistKeyForAction`). */
  wishlistKey?: string
  /** Stock-style inspiration photo for missing items (shopping vibe). */
  inspirationImageUrl?: string
}

export interface ImprovementDirection {
  title: string
  style_archetype: string
  actions: ImprovementAction[]
}

export interface OutfitImprovementSuggestion {
  overall_explanation: string
  /** Attachment-based styling tip inferred from neckline/V-line cues. */
  hairSuggestion?: string
  /** Attachment-based "shoe theory" tip inferred from bottom fit. */
  shoeTheorySuggestion?: string
  missing_items: Array<{ item: string; reason: string; search_query: string }>
  directions: ImprovementDirection[]
}

function normalizeName(s?: string | null) {
  return (s ?? '').toLowerCase().replace(/[\s-]+/g, ' ').trim()
}

type NecklineHint = 'v' | 'crew' | 'off_shoulder' | 'turtleneck' | 'strapless' | 'square' | 'sweetheart' | 'halter' | 'unknown'

function inferNecklineHint(top?: WardrobeItem): NecklineHint {
  if (!top) return 'unknown'
  const name = normalizeName(top.name)

  if (name.includes('v neck') || name.includes('v-neck') || name.includes('vneck') || name.includes('v line') || name.includes('v-line')) return 'v'
  if (name.includes('off shoulder') || name.includes('off-shoulder')) return 'off_shoulder'
  if (name.includes('turtleneck') || name.includes('high neck') || name.includes('high-neck')) return 'turtleneck'
  if (name.includes('strapless') || name.includes('tube top')) return 'strapless'
  if (name.includes('square neck') || name.includes('square-neck')) return 'square'
  if (name.includes('sweetheart')) return 'sweetheart'
  if (name.includes('halter')) return 'halter'
  if (name.includes('crew neck') || name.includes('crew-neck') || name.includes('round neck') || name.includes('round-neck')) return 'crew'

  // Category-based defaults (best-effort, since we don't store neckline explicitly).
  if (top.category === 't_shirt' || top.category === 'long_sleeve' || top.category === 'sweater') return 'crew'
  return 'unknown'
}

function hairstyleSuggestionFromNeckline(hint: NecklineHint): string {
  switch (hint) {
    case 'v':
      return 'V-line / V-neck: try a sleek ponytail or soft waves to frame the neckline.'
    case 'crew':
      return 'Crew/round neck: a high ponytail or bun opens up the face and keeps it clean.'
    case 'off_shoulder':
      return 'Off-shoulder: wear hair down (soft waves) or a side-swept style to highlight the collarbone.'
    case 'turtleneck':
      return 'Turtleneck/high neck: a slick bun or high ponytail keeps the neckline sharp.'
    case 'strapless':
      return 'Strapless: an updo (bun/chignon) or half-up style adds elegance and lengthens the neck.'
    case 'square':
      return 'Square neck: a low bun or half-up waves balances the structured neckline.'
    case 'sweetheart':
      return 'Sweetheart: soft waves or a half-up style complements the curve of the neckline.'
    case 'halter':
      return 'Halter: a high ponytail or bun shows the shoulders and keeps the back clean.'
    default:
      return 'Hair tip: a clean pony/bun is a safe match for most necklines.'
  }
}

type BottomFitHint = 'skinny' | 'straight' | 'wide_leg' | 'flare' | 'bootcut' | 'leggings' | 'jogger' | 'skirt' | 'trousers' | 'unknown'

function inferBottomFitHint(bottom?: WardrobeItem): BottomFitHint {
  if (!bottom) return 'unknown'
  const name = normalizeName(bottom.name)
  const cat = String(bottom.category)

  if (cat === 'leggings' || name.includes('leggings')) return 'leggings'
  if (name.includes('jogger')) return 'jogger'
  if (cat === 'skirt' || name.includes('skirt')) return 'skirt'
  if (cat === 'trousers') return 'trousers'
  if (name.includes('wide leg') || name.includes('wide-leg') || name.includes('palazzo')) return 'wide_leg'
  if (name.includes('bootcut') || name.includes('boot cut')) return 'bootcut'
  if (name.includes('flare') || name.includes('flared')) return 'flare'
  if (name.includes('skinny')) return 'skinny'
  if (name.includes('straight')) return 'straight'

  // Defaults by category
  if (cat === 'jeans' || cat === 'trousers') return 'straight'
  return 'unknown'
}

function shoeTheorySuggestionFromBottomFit(hint: BottomFitHint): string {
  switch (hint) {
    case 'skinny':
      return 'Shoe theory (skinny): knee-high boots, Chelsea boots, loafers/sneakers, or sleek heels.'
    case 'straight':
      return 'Shoe theory (straight): ankle booties, loafers/mules, court sneakers, or classic heels.'
    case 'wide_leg':
      return 'Shoe theory (wide-leg): square/point-toe boots, kitten heels, strappy heels, or sleek sneakers.'
    case 'flare':
      return 'Shoe theory (flare): heeled booties, sock boots, platforms, or pointed heels to lengthen the leg.'
    case 'bootcut':
      return 'Shoe theory (bootcut): pointed-toe boots or heels (or sleek loafers) to keep the line long.'
    case 'leggings':
      return 'Shoe theory (leggings): Chelsea boots, chunky boots, retro sneakers, or loafers for balance.'
    case 'jogger':
      return 'Shoe theory (jogger): clean sneakers, loafers, or a simple heel for an elevated sporty finish.'
    case 'skirt':
      return 'Shoe theory (skirts): mini → loafers/boots, midi → heels/ankle boots, maxi → sleek flats/heels.'
    case 'trousers':
      return 'Shoe theory (trousers): point-toe boots, court sneakers, mules, or strappy heels.'
    default:
      return 'Shoe theory: match volume—wider bottoms like chunkier/structured shoes; slimmer bottoms suit sleek shoes.'
  }
}

function isDarkColourGroup(g: WardrobeItem['colourGroup']) {
  return g === 'black_white' || g === 'jewel'
}

function colourHint(g: WardrobeItem['colourGroup']): string {
  switch (g) {
    case 'neutral':
      return 'beige/off-white'
    case 'pastel':
      return 'soft cream/pastels'
    case 'earth':
      return 'olive/earth tones'
    case 'warm':
      return 'camel/terracotta tones'
    case 'cool':
      return 'charcoal/ink tones'
    case 'jewel':
      return 'deep jewel tones'
    case 'black_white':
      return 'charcoal/black tones'
    default:
      return 'balanced tones'
  }
}

function pickByColourGroups(
  items: WardrobeItem[],
  preferred: WardrobeItem['colourGroup'][],
  excludeId?: string
): WardrobeItem | undefined {
  const filtered = items.filter((i) => (!excludeId || i.id !== excludeId) && preferred.includes(i.colourGroup))
  return filtered[0] ?? items.filter((i) => (!excludeId || i.id !== excludeId))[0]
}

function findCategoryItems(wardrobe: WardrobeItem[]) {
  const tops = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'tops')
  const bottoms = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'bottoms')
  const outerwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'outerwear')
  const footwear = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'footwear')
  const accessories = wardrobe.filter((i) => CATEGORY_TO_GROUP[i.category] === 'accessories')
  return { tops, bottoms, outerwear, footwear, accessories }
}

function missingAction(
  item: string,
  reason: string,
  search_query: string,
  paletteHint: ColourGroup = 'neutral'
): ImprovementAction {
  return {
    type: 'add',
    item,
    source: 'missing',
    reason,
    search_query,
    colourGroup: paletteHint,
    wishlistKey: wishlistKeyForAction('missing', 'add', item, search_query),
    inspirationImageUrl: inspirationImageForSuggestion(search_query, paletteHint),
  }
}

function actionForExisting(
  type: ImprovementActionType,
  item: WardrobeItem,
  reason: string,
  search_query: string
): ImprovementAction {
  const fallback = CATEGORY_LABELS[item.category] ?? 'Wardrobe item'
  const title = item.name && item.name.trim().length > 0 ? item.name.trim() : fallback
  return {
    type,
    item: title,
    source: 'wardrobe',
    reason,
    search_query,
    imageUrl: item.imageUrl,
    colourGroup: item.colourGroup,
    wishlistKey: wishlistKeyForAction('wardrobe', type, title, search_query),
  }
}

export function buildOutfitImprovements(
  wardrobe: WardrobeItem[],
  outfit: Outfit,
  weather: WeatherState,
  occasion: Occasion
): OutfitImprovementSuggestion {
  const { outerwear, footwear, accessories } = findCategoryItems(wardrobe)

  const needOuterwear = weather.tempBand === 'cold' || weather.tempBand === 'mild'
  const top = outfit.top
  const bottom = outfit.bottom
  const outw = outfit.outerwear
  const shoe = outfit.footwear

  const allDark =
    (top ? isDarkColourGroup(top.colourGroup) : false) &&
    (bottom ? isDarkColourGroup(bottom.colourGroup) : false) &&
    (!outw || isDarkColourGroup(outw.colourGroup))

  const preferredLight: WardrobeItem['colourGroup'][] = ['neutral', 'pastel', 'earth', 'warm']

  const currentTopHint = top ? colourHint(top.colourGroup) : 'beige/off-white'
  const currentBottomHint = bottom ? colourHint(bottom.colourGroup) : 'olive/earth tones'

  const missing: OutfitImprovementSuggestion['missing_items'] = []

  const pushMissingIfNeeded = (act: ImprovementAction) => {
    if (act.source !== 'missing') return
    missing.push({ item: act.item, reason: act.reason, search_query: act.search_query })
  }

  const getAccessory = (opts?: { excludeId?: string }) => {
    if (accessories.length === 0) return undefined
    return pickByColourGroups(accessories, allDark ? ['neutral', 'pastel'] : preferredLight, opts?.excludeId)
  }

  const getOuterwear = () => {
    if (outerwear.length === 0) return undefined
    return pickByColourGroups(outerwear, needOuterwear ? preferredLight : preferredLight, outw?.id)
  }

  const getFootwear = (preferred?: WardrobeItem['colourGroup'][]) => {
    if (footwear.length === 0) return undefined
    const pref = preferred && preferred.length > 0 ? preferred : preferredLight
    return pickByColourGroups(footwear, pref, shoe?.id)
  }

  const casualAccessory = getAccessory()
  const elevatedOuterwear = needOuterwear ? getOuterwear() : undefined
  const casualFootwear = getFootwear(allDark ? ['neutral', 'pastel', 'earth'] : undefined)
  // Other direction helpers (swapTop/swapBottom/streetwear) intentionally removed.

  // Build directions with 2–3 actions each.
  const directions: ImprovementDirection[] = []

  const pickSecondAccessory = (excludeId?: string) => {
    if (accessories.length === 0) return undefined
    const alt = accessories.filter((a) => (!excludeId || a.id !== excludeId))
    return pickByColourGroups(alt, preferredLight) ?? alt[0]
  }

  // Casual direction
  {
    const actions: ImprovementAction[] = []

    if (casualAccessory) {
      actions.push(
        actionForExisting(
          'add',
          casualAccessory,
          `Adds an easy accent (${colourHint(casualAccessory.colourGroup)}) without overpowering your ${currentTopHint}/${currentBottomHint} base.`,
          `accessory ${casualAccessory.name || 'belt'} outfit ${colourHint(casualAccessory.colourGroup)}`
        )
      )
    } else {
      const act = missingAction(
        'Beige/off-white belt or light scarf',
        `You don’t have accessories yet, so a light accent helps keep the look balanced (${currentTopHint}/${currentBottomHint}).`,
        `beige belt or light scarf outfit combination`
      )
      actions.push(act)
      pushMissingIfNeeded(act)
    }

    if (!outw && needOuterwear) {
      const ow = elevatedOuterwear
      if (ow) {
        actions.push(
          actionForExisting(
            'add',
            ow,
            `Layer for comfort in ${weather.tempBand} weather. Choose a lighter ${colourHint(ow.colourGroup)} layer.`,
            `layering outerwear ${colourHint(ow.colourGroup)} outfit`
          )
        )
      } else {
        const act = missingAction(
          'Olive lightweight jacket / cardigan',
          'No outerwear in your wardrobe. A light layer makes this outfit wearable for cooler weather.',
          'olive jacket cardigan layering outfit'
        )
        actions.push(act)
        pushMissingIfNeeded(act)
      }
    }

    if (casualFootwear && shoe && casualFootwear.id !== shoe.id) {
      actions.push(
        actionForExisting(
          'swap',
          casualFootwear,
          `Switch footwear to a ${colourHint(casualFootwear.colourGroup)} option for a softer overall tone.`,
          `footwear ${casualFootwear.category} ${colourHint(casualFootwear.colourGroup)} outfit`
        )
      )
    }

    // Ensure we have at least 2 actionable directions.
    if (actions.length < 2) {
      const altAcc = pickSecondAccessory(casualAccessory?.id)
      if (altAcc) {
        actions.push(
          actionForExisting(
            'add',
            altAcc,
            `Second accent to complete the look (${colourHint(altAcc.colourGroup)}), keeping the palette balanced.`,
            `accessory ${altAcc.category} ${colourHint(altAcc.colourGroup)} outfit`
          )
        )
      } else {
        const act = missingAction(
          'Charcoal or olive statement earrings',
          'Add one more small accessory to complete the casual outfit.',
          'statement earrings charcoal olive outfit'
        )
        actions.push(act)
        pushMissingIfNeeded(act)
      }
    }

    directions.push({
      title: 'Casual, comfy upgrade',
      style_archetype: 'Casual relaxed (minimal layers, day-ready)',
      actions: actions.slice(0, 3),
    })
  }

  // NOTE: Intentionally only returning the "Casual, comfy upgrade" direction.
  // Other directions (e.g. "Elevated minimal", "Streetwear balance") have been removed per product request.

  const missingItemsUnique = (() => {
    const map = new Map<string, { item: string; reason: string; search_query: string }>()
    for (const m of missing) {
      map.set(m.item, m)
    }
    return Array.from(map.values())
  })()

  const overall_explanation = `${occasion} · ${weather.tempBand} weather — balanced palette & layering ideas below.`
  const hairSuggestion = hairstyleSuggestionFromNeckline(inferNecklineHint(outfit.top))
  const shoeTheorySuggestion = shoeTheorySuggestionFromBottomFit(inferBottomFitHint(outfit.bottom))

  return {
    overall_explanation,
    hairSuggestion,
    shoeTheorySuggestion,
    missing_items: missingItemsUnique,
    directions,
  }
}

