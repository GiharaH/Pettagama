// PRD-aligned types for Pettagama

export type BodyShape =
  | 'hourglass'
  | 'pear'
  | 'apple'
  | 'rectangle'
  | 'inverted_triangle'
  | 'prefer_not_to_say'

export type StylePreference = 'casual' | 'formal' | 'mixed'

export type Occasion =
  | 'casual'
  | 'office'
  | 'party'
  | 'wedding'
  | 'religious'
  | 'active'
  | 'date_night'
  | 'travel'
  | 'graduation'
  | string

// Wardrobe categories (PRD Section 05)
export type TopCategory =
  | 't_shirt'
  | 'top_blouse'
  | 'long_sleeve'
  | 'sweater'
  | 'kurtha'
  | 'saree'

export type BottomCategory =
  | 'jeans'
  | 'trousers'
  | 'skirt'
  | 'leggings'
  | 'salwar_palazzo'

export type OuterwearCategory = 'jacket' | 'coat' | 'blazer' | 'dupatta_stole'

export type FootwearCategory =
  | 'heels'
  | 'sneakers'
  | 'boots'
  | 'sandals_flats'
  | 'traditional'

export type AccessoryCategory =
  | 'necklace'
  | 'earrings_rings'
  | 'bangles_bracelets'
  | 'bag_clutch'
  | 'belt_scarf'

export type WardrobeCategory =
  | TopCategory
  | BottomCategory
  | OuterwearCategory
  | FootwearCategory
  | AccessoryCategory

export type CategoryGroup = 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories'

export const CATEGORY_TO_GROUP: Record<WardrobeCategory, CategoryGroup> = {
  t_shirt: 'tops',
  top_blouse: 'tops',
  long_sleeve: 'tops',
  sweater: 'tops',
  kurtha: 'tops',
  saree: 'tops',
  jeans: 'bottoms',
  trousers: 'bottoms',
  skirt: 'bottoms',
  leggings: 'bottoms',
  salwar_palazzo: 'bottoms',
  jacket: 'outerwear',
  coat: 'outerwear',
  blazer: 'outerwear',
  dupatta_stole: 'outerwear',
  heels: 'footwear',
  sneakers: 'footwear',
  boots: 'footwear',
  sandals_flats: 'footwear',
  traditional: 'footwear',
  necklace: 'accessories',
  earrings_rings: 'accessories',
  bangles_bracelets: 'accessories',
  bag_clutch: 'accessories',
  belt_scarf: 'accessories',
}

// Colour groups for coordination (simplified)
export type ColourGroup =
  | 'neutral'
  | 'warm'
  | 'cool'
  | 'earth'
  | 'jewel'
  | 'pastel'
  | 'black_white'

export type SeasonSuitability = 'summer' | 'winter' | 'all_season'

export interface WardrobeItem {
  id: string
  name: string
  imageUrl: string
  category: WardrobeCategory
  colourGroup: ColourGroup
  season: SeasonSuitability
  occasionTags: Occasion[]
  notes?: string
  createdAt: string
}

export interface Outfit {
  id: string
  top?: WardrobeItem
  bottom?: WardrobeItem
  outerwear?: WardrobeItem
  footwear?: WardrobeItem
  accessories: WardrobeItem[]
  occasion: Occasion
  createdAt: string
}

export interface UserProfile {
  bodyShape: BodyShape | null
  stylePreference: StylePreference
  locationGranted: boolean
  lat?: number
  lon?: number
  onboardingComplete: boolean
}

export interface WeatherState {
  temp: number
  condition: 'clear' | 'rain' | 'clouds' | 'wind' | 'snow' | 'unknown'
  description: string
  tempBand: 'cold' | 'mild' | 'warm' | 'hot'
  cachedAt: number
}

export interface FavouriteOutfit {
  outfit: Outfit
  savedAt: string
}
