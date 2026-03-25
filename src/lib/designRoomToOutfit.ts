import type { ClothingItem } from '@outfit-designer/components/WardrobeSelector'
import type { Outfit, WardrobeItem } from '@/types'

/** Design Room canvas slots (keys match `WardrobeSelector` categories). */
export type DesignRoomSelectedItems = Record<string, ClothingItem | null>

/** Build a Pettagama `Outfit` from Design Room slots using live wardrobe rows (by item id). */
export function buildOutfitFromDesignRoomSelection(
  selectedItems: DesignRoomSelectedItems,
  wardrobe: WardrobeItem[]
): Outfit | null {
  const byId = new Map(wardrobe.map((i) => [i.id, i]))

  const top = selectedItems.tops ? byId.get(selectedItems.tops.id) : undefined
  const bottom = selectedItems.bottoms ? byId.get(selectedItems.bottoms.id) : undefined
  const outerwear = selectedItems.outerwear ? byId.get(selectedItems.outerwear.id) : undefined
  const footwear = selectedItems.shoes ? byId.get(selectedItems.shoes.id) : undefined
  const acc = selectedItems.accessories ? byId.get(selectedItems.accessories.id) : undefined

  const accessories = acc ? [acc] : []

  if (!top && !bottom && !outerwear && !footwear && accessories.length === 0) {
    return null
  }

  const now = new Date().toISOString()
  return {
    id: `design-room-${Date.now()}`,
    top,
    bottom,
    outerwear,
    footwear,
    accessories,
    occasion: 'casual',
    createdAt: now,
  }
}
