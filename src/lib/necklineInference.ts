import type { HairNecklineKey, WardrobeItem } from '@/types'

function normalizeName(s?: string | null) {
  return (s ?? '').toLowerCase().replace(/[\s-]+/g, ' ').trim()
}

/**
 * Infer Hair Advisor neckline key from top garment name + category (same cues as outfit improvements).
 */
export function inferNecklineTypeForTop(top: WardrobeItem | undefined): HairNecklineKey {
  if (!top) return 'crew_round'
  const name = normalizeName(top.name)

  if (name.includes('v neck') || name.includes('v-neck') || name.includes('vneck') || name.includes('v line') || name.includes('v-line'))
    return 'v_neck_deep'
  if (name.includes('off shoulder') || name.includes('off-shoulder')) return 'off_shoulder'
  if (name.includes('turtleneck') || name.includes('high neck') || name.includes('high-neck')) return 'turtleneck'
  if (name.includes('strapless') || name.includes('tube top')) return 'strapless'
  if (name.includes('square neck') || name.includes('square-neck')) return 'square_neck'
  if (name.includes('sweetheart')) return 'strapless'
  if (name.includes('halter') || name.includes('keyhole')) return 'halter_keyhole'
  if (name.includes('crew neck') || name.includes('crew-neck') || name.includes('round neck') || name.includes('round-neck'))
    return 'crew_round'

  if (top.category === 't_shirt' || top.category === 'long_sleeve' || top.category === 'sweater') return 'crew_round'
  if (top.category === 'kurtha' || top.category === 'saree' || top.category === 'top_blouse') return 'v_neck_deep'

  return 'crew_round'
}
