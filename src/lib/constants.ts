import type { BodyShape, Occasion, WardrobeCategory } from '@/types'

export const BODY_SHAPES: { value: BodyShape; label: string; short: string }[] = [
  { value: 'hourglass', label: 'Hourglass', short: 'Balanced bust and hips, defined waist' },
  { value: 'pear', label: 'Pear', short: 'Hips wider than shoulders' },
  { value: 'apple', label: 'Apple', short: 'Broader midsection' },
  { value: 'rectangle', label: 'Rectangle', short: 'Similar width at shoulders, waist, hips' },
  { value: 'inverted_triangle', label: 'Inverted Triangle', short: 'Shoulders broader than hips' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', short: 'No shape-based filtering' },
]

export const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'casual', label: 'Casual / Everyday' },
  { value: 'office', label: 'Office / Business Casual' },
  { value: 'party', label: 'Party / Evening Out' },
  { value: 'wedding', label: 'Wedding / Formal' },
  { value: 'religious', label: 'Religious / Cultural' },
  { value: 'active', label: 'Active / Gym' },
  { value: 'date_night', label: 'Date Night' },
  { value: 'travel', label: 'Travel' },
  { value: 'graduation', label: 'Graduation' },
]

export const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  t_shirt: 'T-Shirt',
  top_blouse: 'Top / Blouse',
  long_sleeve: 'Long Sleeve',
  sweater: 'Sweater',
  kurtha: 'Kurtha',
  saree: 'Saree',
  jeans: 'Jeans',
  trousers: 'Trousers',
  skirt: 'Skirt',
  leggings: 'Leggings',
  salwar_palazzo: 'Salwar / Palazzo',
  jacket: 'Jacket',
  coat: 'Coat',
  blazer: 'Blazer',
  dupatta_stole: 'Dupatta / Stole',
  heels: 'Heels',
  sneakers: 'Sneakers',
  boots: 'Boots',
  sandals_flats: 'Sandals / Flats',
  traditional: 'Traditional Footwear',
  necklace: 'Necklace',
  earrings_rings: 'Earrings / Rings',
  bangles_bracelets: 'Bangles / Bracelets',
  bag_clutch: 'Bag / Clutch',
  belt_scarf: 'Belt / Scarf',
}

export const COLOUR_GROUPS = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'earth', label: 'Earth' },
  { value: 'jewel', label: 'Jewel' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'black_white', label: 'Black / White' },
] as const

export const SEASONS = [
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
  { value: 'all_season', label: 'All season' },
] as const

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as WardrobeCategory[]

/** Nice-to-have clothing suggestions shown after outfit generation, with inspiration photos */
export const NICE_TO_HAVE_SUGGESTIONS: { title: string; imageUrl: string }[] = [
  { title: 'Neutral belt', imageUrl: 'https://source.unsplash.com/featured/400x520/?fashion,belt,accessory' },
  { title: 'Statement earrings', imageUrl: 'https://source.unsplash.com/featured/400x520/?earrings,jewelry,fashion' },
  { title: 'Classic watch', imageUrl: 'https://source.unsplash.com/featured/400x520/?watch,fashion,accessory' },
  { title: 'Scarf or stole', imageUrl: 'https://source.unsplash.com/featured/400x520/?scarf,fashion,style' },
  { title: 'Structured bag', imageUrl: 'https://source.unsplash.com/featured/400x520/?handbag,fashion,bag' },
]
