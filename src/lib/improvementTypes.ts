import type { ColourGroup } from '@/types'

/** Legacy wishlist rows may reference these; `addWishlistFromAction` still accepts this shape. */
export type ImprovementSource = 'wardrobe' | 'missing'
export type ImprovementActionType = 'add' | 'swap'

export interface ImprovementAction {
  type: ImprovementActionType
  item: string
  source: ImprovementSource
  reason: string
  search_query: string
  imageUrl?: string
  colourGroup?: ColourGroup
  wishlistKey?: string
  inspirationImageUrl?: string
}
