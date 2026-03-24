import type { ColourGroup } from '@/types'

/**
 * Curated stock-style photos (Unsplash) for “shop the vibe” inspiration — not product links.
 * Picked for stable URLs + fashion/clothing context.
 */
const POOLS: Record<string, string[]> = {
  accessory: [
    'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611652028919-a5022bebf3f4?w=400&h=500&fit=crop&q=80',
  ],
  belt_scarf: [
    'https://images.unsplash.com/photo-1624378515193-6e7c902a637c?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80',
  ],
  footwear: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c8ebd43d3b8?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop&q=80',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop&q=80',
  ],
  bag: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop&q=80',
  ],
}

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function poolKeyForQuery(q: string): keyof typeof POOLS {
  const s = q.toLowerCase()
  if (/(earring|necklace|jewelry|watch|bracelet|ring)/.test(s)) return 'jewelry'
  if (/(belt|scarf)/.test(s)) return 'belt_scarf'
  if (/(bag|crossbody|clutch)/.test(s)) return 'bag'
  if (/(jacket|coat|blazer|cardigan|layer|outer)/.test(s)) return 'outerwear'
  if (/(shoe|sneaker|heel|boot|footwear|sandal)/.test(s)) return 'footwear'
  if (/(accessor|belt )/.test(s)) return 'accessory'
  return 'default'
}

/** Deterministic “shop inspiration” image for a missing-item suggestion. */
export function inspirationImageForSuggestion(search_query: string, colourGroup?: ColourGroup): string {
  const key = poolKeyForQuery(search_query)
  const pool = POOLS[key] ?? POOLS.default
  const idx = simpleHash(`${search_query}|${colourGroup ?? ''}`) % pool.length
  return pool[idx]
}
