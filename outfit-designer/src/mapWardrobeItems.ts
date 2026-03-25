import type { WardrobeItem } from '@/types'
import { CATEGORY_TO_GROUP } from '@/types'
import type { ClothingItem } from './components/WardrobeSelector'

const COLOUR_GROUP_TO_COLOR: Record<string, string> = {
  neutral: 'beige',
  warm: 'brown',
  cool: 'blue',
  earth: 'olive',
  jewel: 'navy',
  pastel: 'pink',
  black_white: 'black',
}

/** Map Pettagama wardrobe rows into design-room categories (footwear → shoes). */
export function mapWardrobeToDesignRoomItems(items: WardrobeItem[]): ClothingItem[] {
  return items.map((item) => {
    const group = CATEGORY_TO_GROUP[item.category]
    const category = group === 'footwear' ? 'shoes' : group
    return {
      id: item.id,
      name: item.name?.trim() || 'Untitled',
      category,
      image: item.imageUrl,
      color: COLOUR_GROUP_TO_COLOR[item.colourGroup] ?? 'neutral',
      style: 'casual',
      tags: item.occasionTags?.length ? [...item.occasionTags] : ['wardrobe'],
    }
  })
}
