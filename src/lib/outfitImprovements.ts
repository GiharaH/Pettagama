import type { Occasion, Outfit, WeatherState, WardrobeItem } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import { CATEGORY_TO_GROUP } from '@/types'

export type ImprovementSource = 'wardrobe' | 'missing'
export type ImprovementActionType = 'add' | 'swap'

export interface ImprovementAction {
  type: ImprovementActionType
  item: string
  source: ImprovementSource
  reason: string
  search_query: string
}

export interface ImprovementDirection {
  title: string
  style_archetype: string
  actions: ImprovementAction[]
}

export interface OutfitImprovementSuggestion {
  overall_explanation: string
  missing_items: Array<{ item: string; reason: string; search_query: string }>
  directions: ImprovementDirection[]
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

function missingAction(item: string, reason: string, search_query: string): ImprovementAction {
  return { type: 'add', item, source: 'missing', reason, search_query }
}

function actionForExisting(
  type: ImprovementActionType,
  item: WardrobeItem,
  reason: string,
  search_query: string
): ImprovementAction {
  const fallback = CATEGORY_LABELS[item.category] ?? 'Wardrobe item'
  const title = item.name && item.name.trim().length > 0 ? item.name.trim() : fallback
  return { type, item: title, source: 'wardrobe', reason, search_query }
}

export function buildOutfitImprovements(
  wardrobe: WardrobeItem[],
  outfit: Outfit,
  weather: WeatherState,
  occasion: Occasion
): OutfitImprovementSuggestion {
  const { tops, bottoms, outerwear, footwear, accessories } = findCategoryItems(wardrobe)

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
  const preferredCool: WardrobeItem['colourGroup'][] = ['cool']

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

  const getSwapTop = () => {
    if (!top) return undefined
    if (!isDarkColourGroup(top.colourGroup)) return undefined
    return pickByColourGroups(tops, preferredLight, top.id)
  }

  const getSwapBottom = () => {
    if (!bottom) return undefined
    if (!isDarkColourGroup(bottom.colourGroup)) return undefined
    return pickByColourGroups(bottoms, preferredLight, bottom.id)
  }

  const casualAccessory = getAccessory()
  const elevatedOuterwear = needOuterwear ? getOuterwear() : undefined
  const casualFootwear = getFootwear(allDark ? ['neutral', 'pastel', 'earth'] : undefined)

  const swapTop = getSwapTop()
  const swapBottom = getSwapBottom()

  const elevatedFootwear = getFootwear(preferredCool)
  const streetAccessory = getAccessory({ excludeId: casualAccessory?.id })

  const streetOuterwear =
    needOuterwear && outw
      ? getOuterwear()
      : needOuterwear
        ? getOuterwear()
        : undefined

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

  // Elevated direction
  {
    const actions: ImprovementAction[] = []

    if (needOuterwear) {
      if (elevatedOuterwear) {
        actions.push(
          actionForExisting(
            'add',
            elevatedOuterwear,
            `Elevates the silhouette with a structured ${colourHint(elevatedOuterwear.colourGroup)} layer.`,
            `structured coat blazer ${colourHint(elevatedOuterwear.colourGroup)} outfit`
          )
        )
      } else {
        const act = missingAction(
          'Structured blazer / coat in off-white or olive',
          'You have no outerwear for layering. Add a structured layer to make the look more polished.',
          'off-white or olive structured blazer coat outfit'
        )
        actions.push(act)
        pushMissingIfNeeded(act)
      }
    }

    const swapTargetTop = swapTop
    if (swapTargetTop) {
      actions.push(
        actionForExisting(
          'swap',
          swapTargetTop,
          `Swapping to ${colourHint(swapTargetTop.colourGroup)} reduces an all-dark feel and keeps proportions flattering.`,
          `top swap ${colourHint(swapTargetTop.colourGroup)} minimalist outfit`
        )
      )
    } else if (!swapTargetTop && swapBottom) {
      actions.push(
        actionForExisting(
          'swap',
          swapBottom,
          `Swap bottom to ${colourHint(swapBottom.colourGroup)} for a more balanced, elevated palette.`,
          `bottom swap ${colourHint(swapBottom.colourGroup)} outfit`
        )
      )
    }

    const footwearForElevated = elevatedFootwear ?? casualFootwear
    if (footwearForElevated && shoe && footwearForElevated.id !== shoe.id) {
      actions.push(
        actionForExisting(
          'swap',
          footwearForElevated,
          `Refines the look with ${colourHint(footwearForElevated.colourGroup)} footwear that works with your off-white/olive direction.`,
          `refined footwear ${footwearForElevated.category} ${colourHint(footwearForElevated.colourGroup)}`
        )
      )
    }

    // Ensure 2 actions minimum for the elevated direction.
    if (actions.length < 2) {
      const acc = getAccessory()
      if (acc) {
        actions.push(
          actionForExisting(
            'add',
            acc,
            `Polishes the outfit with a ${colourHint(acc.colourGroup)} accent that won’t make it feel all-dark.`,
            `polished accent accessory ${acc.category} ${colourHint(acc.colourGroup)} outfit`
          )
        )
      } else {
        const act = missingAction(
          'Minimal watch + belt combo (off-white/beige)',
          'No accessories found. A subtle watch/belt pairing gives an elevated finish.',
          'minimal watch belt outfit beige'
        )
        actions.push(act)
        pushMissingIfNeeded(act)
      }
    }

    directions.push({
      title: 'Elevated minimal',
      style_archetype: 'Minimal + polished (off-white/olive balance)',
      actions: actions.slice(0, 3),
    })
  }

  // Streetwear direction
  {
    const actions: ImprovementAction[] = []

    if (streetOuterwear && needOuterwear) {
      actions.push(
        actionForExisting(
          'add',
          streetOuterwear,
          `Layer with street-ready texture. Keep it ${colourHint(streetOuterwear.colourGroup)} to stay balanced.`,
          `streetwear layering ${colourHint(streetOuterwear.colourGroup)} outerwear`
        )
      )
    } else if (needOuterwear) {
      const act = missingAction(
        'Charcoal/olive overshirt or utility jacket',
        'No streetwear-friendly layer in your wardrobe. Add one so the outfit reads as intentional for cooler weather.',
        'charcoal overshirt utility jacket streetwear outfit'
      )
      actions.push(act)
      pushMissingIfNeeded(act)
    }

    if (streetAccessory) {
      actions.push(
        actionForExisting(
          'add',
          streetAccessory,
          `Adds street texture with a ${colourHint(streetAccessory.colourGroup)} accessory.`,
          `statement accessory ${streetAccessory.category} ${colourHint(streetAccessory.colourGroup)} streetwear`
        )
      )
    } else {
      const act = missingAction(
        'Structured crossbody bag or statement earrings',
        'No accessories found. Add one statement piece to complete the streetwear direction.',
        'structured crossbody bag statement earrings outfit'
      )
      actions.push(act)
      pushMissingIfNeeded(act)
    }

    const sneakerCandidate = footwear.find((f) => f.category === 'sneakers') ?? getFootwear(preferredLight)
    if (sneakerCandidate && shoe && sneakerCandidate.id !== shoe.id) {
      actions.push(
        actionForExisting(
          'swap',
          sneakerCandidate,
          `Switch to sneakers for a street-ready finish while keeping colours grounded (${colourHint(sneakerCandidate.colourGroup)}).`,
          `sneakers ${colourHint(sneakerCandidate.colourGroup)} outfit`
        )
      )
    }

    directions.push({
      title: 'Streetwear balance',
      style_archetype: 'Streetwear (overshirt + statement accent)',
      actions: actions.slice(0, 3),
    })
  }

  const missingItemsUnique = (() => {
    const map = new Map<string, { item: string; reason: string; search_query: string }>()
    for (const m of missing) {
      map.set(m.item, m)
    }
    return Array.from(map.values())
  })()

  const overall_explanation = `For a ${occasion} outfit in ${weather.tempBand} weather, these upgrades keep the palette balanced (off-white/beige/olive + charcoal accents) and add practical layering when needed.`

  return {
    overall_explanation,
    missing_items: missingItemsUnique,
    directions,
  }
}

