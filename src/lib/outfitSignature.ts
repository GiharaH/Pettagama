import type { Outfit } from '@/types'

/** Stable identity for an outfit from wardrobe item ids (order-independent for accessories). */
export function outfitSignature(outfit: Outfit): string {
  const accIds = [...outfit.accessories.map((a) => a.id)].sort().join(',')
  return [
    outfit.top?.id ?? '',
    outfit.bottom?.id ?? '',
    outfit.outerwear?.id ?? '',
    outfit.footwear?.id ?? '',
    accIds,
  ].join('|')
}
