import type {
  UserProfile,
  WardrobeItem,
  FavouriteOutfit,
  UserDetails,
  WishlistItem,
  Occasion,
  WeatherState,
  Outfit,
} from '@/types'
import type { ImprovementAction, OutfitImprovementSuggestion } from '@/lib/outfitImprovements'
import { wishlistKeyForAction } from '@/lib/wishlistKeys'
import { outfitSignature } from '@/lib/outfitSignature'

const KEYS = {
  PROFILE: 'pettagama_profile',
  WARDROBE: 'pettagama_wardrobe',
  FAVOURITES: 'pettagama_favourites',
  USER_DETAILS: 'pettagama_user_details',
  WISHLIST: 'pettagama_wishlist',
  SUGGESTED_OUTFITS: 'pettagama_suggested_outfits',
  RECENT_OUTFIT_SIGNATURES: 'pettagama_recent_outfit_signatures',
} as const

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export interface SuggestedOutfitEntry {
  outfit: Outfit
  occasion: Occasion
  weather: WeatherState
  improvements?: OutfitImprovementSuggestion
  addedAt: string
}

export interface RecentOutfitSignature {
  signature: string
  shownAt: string
}

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

/** Save a look to favourites; skips if the same wardrobe combination is already saved. */
export function saveFavouriteBySignature(outfit: FavouriteOutfit['outfit']): boolean {
  const sig = outfitSignature(outfit)
  const favs = getFavourites()
  if (favs.some((f) => outfitSignature(f.outfit) === sig)) return false
  favs.push({ outfit, savedAt: new Date().toISOString() })
  saveFavourites(favs)
  return true
}

export function getSuggestedOutfits(): SuggestedOutfitEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.SUGGESTED_OUTFITS)
    if (!raw) return []
    return JSON.parse(raw) as SuggestedOutfitEntry[]
  } catch {
    return []
  }
}

export function saveSuggestedOutfits(entries: SuggestedOutfitEntry[]): void {
  localStorage.setItem(KEYS.SUGGESTED_OUTFITS, JSON.stringify(entries))
}

export function clearSuggestedOutfits(): void {
  localStorage.removeItem(KEYS.SUGGESTED_OUTFITS)
}

function pruneRecentSignatures(entries: RecentOutfitSignature[]): RecentOutfitSignature[] {
  const cutoff = Date.now() - WEEK_MS
  return entries.filter((e) => new Date(e.shownAt).getTime() > cutoff)
}

export function getRecentOutfitSignaturesSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_OUTFIT_SIGNATURES)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as RecentOutfitSignature[]
    const pruned = pruneRecentSignatures(parsed)
    if (pruned.length !== parsed.length) {
      localStorage.setItem(KEYS.RECENT_OUTFIT_SIGNATURES, JSON.stringify(pruned))
    }
    return new Set(pruned.map((e) => e.signature))
  } catch {
    return new Set()
  }
}

/** Record signatures when new outfits are shown (for 7-day repeat avoidance). */
export function recordOutfitsShown(signatures: string[]): void {
  if (signatures.length === 0) return
  try {
    const raw = localStorage.getItem(KEYS.RECENT_OUTFIT_SIGNATURES)
    const existing = raw ? (JSON.parse(raw) as RecentOutfitSignature[]) : []
    const now = new Date().toISOString()
    const merged = [...pruneRecentSignatures(existing)]
    for (const signature of signatures) {
      merged.push({ signature, shownAt: now })
    }
    // Dedupe by signature keeping latest shownAt
    const bySig = new Map<string, RecentOutfitSignature>()
    for (const e of merged) {
      bySig.set(e.signature, e)
    }
    localStorage.setItem(KEYS.RECENT_OUTFIT_SIGNATURES, JSON.stringify([...bySig.values()]))
  } catch {
    // ignore
  }
}

export function getWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(KEYS.WISHLIST)
    if (!raw) return []
    return JSON.parse(raw) as WishlistItem[]
  } catch {
    return []
  }
}

export function saveWishlist(items: WishlistItem[]): void {
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(items))
}

export function addWishlistFromAction(action: ImprovementAction): boolean {
  const id =
    action.wishlistKey ?? wishlistKeyForAction(action.source, action.type, action.item, action.search_query)
  const list = getWishlist()
  if (list.some((i) => i.id === id)) return false
  const imageUrl = action.imageUrl || action.inspirationImageUrl
  saveWishlist([
    ...list,
    {
      id,
      title: action.item,
      note: action.reason,
      imageUrl,
      addedAt: new Date().toISOString(),
    },
  ])
  return true
}
