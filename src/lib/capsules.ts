import type { ColourGroup, Occasion, Outfit, WardrobeItem } from '@/types'

export const PRESET_CAPSULE_ORDER = [
  'everyday',
  'office',
  'party',
  'traditional',
  'wedding_events',
  'travel',
] as const

export type PresetCapsuleId = (typeof PRESET_CAPSULE_ORDER)[number]

export interface PresetCapsuleDefinition {
  id: PresetCapsuleId
  name: string
  icon: string
  /** Shown under the title on the list card */
  notes?: string
}

export const PRESET_CAPSULES: PresetCapsuleDefinition[] = [
  { id: 'everyday', name: 'Everyday / Street', icon: '🌿', notes: 'Default — casual & street looks' },
  { id: 'office', name: 'Office', icon: '💼', notes: 'Business casual & workwear' },
  { id: 'party', name: 'Party & Nights Out', icon: '🎉', notes: 'Evening & going-out' },
  { id: 'traditional', name: 'Traditional', icon: '🪔', notes: 'Sarees, kurthas & full sets' },
  { id: 'wedding_events', name: 'Wedding & Events', icon: '💍', notes: 'Formal occasion wear' },
  { id: 'travel', name: 'Travel', icon: '✈️', notes: 'Lightweight, versatile pieces' },
]

/** Representative hex swatches for wardrobe colour groups (capsule palette strip). */
export const COLOUR_GROUP_HEX: Record<ColourGroup, string> = {
  neutral: '#c4b8a8',
  warm: '#b5651d',
  cool: '#4a6fa5',
  earth: '#6b5b4f',
  jewel: '#1e3a5f',
  pastel: '#e8c4c4',
  black_white: '#2a2a2a',
}

export function presetCapsuleIdFromOccasion(occasion: Occasion): PresetCapsuleId {
  const o = String(occasion).toLowerCase()
  if (o === 'office') return 'office'
  if (o === 'party' || o === 'date_night') return 'party'
  if (o === 'religious') return 'traditional'
  if (o === 'wedding' || o === 'graduation') return 'wedding_events'
  if (o === 'travel') return 'travel'
  if (o === 'casual' || o === 'active') return 'everyday'
  return 'everyday'
}

export function isPresetCapsuleId(id: string): id is PresetCapsuleId {
  return (PRESET_CAPSULE_ORDER as readonly string[]).includes(id)
}

function outfitPieces(outfit: Outfit): WardrobeItem[] {
  const list: WardrobeItem[] = []
  if (outfit.top) list.push(outfit.top)
  if (outfit.bottom) list.push(outfit.bottom)
  if (outfit.outerwear) list.push(outfit.outerwear)
  if (outfit.footwear) list.push(outfit.footwear)
  list.push(...outfit.accessories)
  return list
}

/** Up to `max` unique palette colours from all outfits in a capsule. */
export function paletteHexesFromOutfits(outfits: Outfit[], max = 8): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const outfit of outfits) {
    for (const item of outfitPieces(outfit)) {
      const hex = COLOUR_GROUP_HEX[item.colourGroup]
      if (!seen.has(hex)) {
        seen.add(hex)
        out.push(hex)
        if (out.length >= max) return out
      }
    }
  }
  return out
}

export function averageHarmonyScores(scores: (number | null | undefined)[]): number | null {
  const valid = scores.filter((s): s is number => typeof s === 'number' && !Number.isNaN(s))
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

export function formatCapsuleDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}
