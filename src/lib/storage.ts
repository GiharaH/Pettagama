import type { UserProfile, WardrobeItem, FavouriteOutfit, UserDetails } from '@/types'

const KEYS = {
  PROFILE: 'pettagama_profile',
  WARDROBE: 'pettagama_wardrobe',
  FAVOURITES: 'pettagama_favourites',
  USER_DETAILS: 'pettagama_user_details',
} as const

const defaultUserDetails: UserDetails = {
  name: '',
  gender: '',
  age: '',
  heightCm: '',
  weightKg: '',
  profilePictureUrl: '',
}

export function getUserDetails(): UserDetails {
  try {
    const raw = localStorage.getItem(KEYS.USER_DETAILS)
    if (!raw) return { ...defaultUserDetails }
    return { ...defaultUserDetails, ...JSON.parse(raw) } as UserDetails
  } catch {
    return { ...defaultUserDetails }
  }
}

export function saveUserDetails(details: UserDetails): void {
  localStorage.setItem(KEYS.USER_DETAILS, JSON.stringify(details))
}

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
