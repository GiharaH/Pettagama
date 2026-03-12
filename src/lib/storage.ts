import type { UserProfile, WardrobeItem, FavouriteOutfit } from '@/types'

const KEYS = {
  PROFILE: 'pettagama_profile',
  WARDROBE: 'pettagama_wardrobe',
  FAVOURITES: 'pettagama_favourites',
} as const

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

export function getWardrobe(): WardrobeItem[] {
  try {
    const raw = localStorage.getItem(KEYS.WARDROBE)
    if (!raw) return []
    return JSON.parse(raw) as WardrobeItem[]
  } catch {
    return []
  }
}

export function saveWardrobe(items: WardrobeItem[]): void {
  localStorage.setItem(KEYS.WARDROBE, JSON.stringify(items))
}

export function getFavourites(): FavouriteOutfit[] {
  try {
    const raw = localStorage.getItem(KEYS.FAVOURITES)
    if (!raw) return []
    return JSON.parse(raw) as FavouriteOutfit[]
  } catch {
    return []
  }
}

export function saveFavourites(favourites: FavouriteOutfit[]): void {
  localStorage.setItem(KEYS.FAVOURITES, JSON.stringify(favourites))
}
