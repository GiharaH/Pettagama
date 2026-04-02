import type {
  UserProfile,
  WardrobeItem,
  FavouriteOutfit,
  CapsuleSavedEntry,
  UserDetails,
  WishlistItem,
  Occasion,
  WeatherState,
  Outfit,
} from '@/types'
import type { ImprovementAction, OutfitImprovementSuggestion } from '@/lib/outfitImprovements'
import { wishlistKeyForAction } from '@/lib/wishlistKeys'
import { outfitSignature } from '@/lib/outfitSignature'
import {
  type PresetCapsuleId,
  PRESET_CAPSULE_ORDER,
  presetCapsuleIdFromOccasion,
} from '@/lib/capsules'

const KEYS = {
  PROFILE: 'pettagama_profile',
  WARDROBE: 'pettagama_wardrobe',
  FAVOURITES: 'pettagama_favourites',
  USER_DETAILS: 'pettagama_user_details',
  WISHLIST: 'pettagama_wishlist',
  SUGGESTED_OUTFITS: 'pettagama_suggested_outfits',
  RECENT_OUTFIT_SIGNATURES: 'pettagama_recent_outfit_signatures',
  HAIR_STYLE_NOTES: 'pettagama_hair_style_notes',
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

/** v2 persisted capsule wardrobe */
export interface CapsulesStateV2 {
  version: 2
  presets: Record<PresetCapsuleId, CapsuleSavedEntry[]>
  customCapsules: Array<{
    id: string
    name: string
    createdAt: string
    entries: CapsuleSavedEntry[]
  }>
}

function emptyPresetRecord(): Record<PresetCapsuleId, CapsuleSavedEntry[]> {
  const r = {} as Record<PresetCapsuleId, CapsuleSavedEntry[]>
  for (const id of PRESET_CAPSULE_ORDER) {
    r[id] = []
  }
  return r
}

function emptyCapsulesV2(): CapsulesStateV2 {
  return { version: 2, presets: emptyPresetRecord(), customCapsules: [] }
}

function migrateV1ArrayToV2(rows: FavouriteOutfit[]): CapsulesStateV2 {
  const state = emptyCapsulesV2()
  for (const row of rows) {
    const capsuleId = presetCapsuleIdFromOccasion(row.outfit.occasion)
    state.presets[capsuleId].push({
      outfit: row.outfit,
      savedAt: row.savedAt,
    })
  }
  return state
}

function normalizeV2(parsed: Partial<CapsulesStateV2>): CapsulesStateV2 {
  const base = emptyCapsulesV2()
  if (parsed.presets) {
    for (const id of PRESET_CAPSULE_ORDER) {
      const arr = parsed.presets[id]
      base.presets[id] = Array.isArray(arr) ? arr : []
    }
  }
  if (Array.isArray(parsed.customCapsules)) {
    base.customCapsules = parsed.customCapsules.map((c) => ({
      id: typeof c.id === 'string' ? c.id : `custom-${crypto.randomUUID()}`,
      name: typeof c.name === 'string' ? c.name : 'My capsule',
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
      entries: Array.isArray(c.entries) ? c.entries : [],
    }))
  }
  return base
}

export function loadCapsulesState(): CapsulesStateV2 {
  try {
    const raw = localStorage.getItem(KEYS.FAVOURITES)
    if (!raw) return emptyCapsulesV2()
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      const migrated = migrateV1ArrayToV2(parsed as FavouriteOutfit[])
      persistCapsulesState(migrated)
      return migrated
    }
    if (parsed && typeof parsed === 'object' && (parsed as CapsulesStateV2).version === 2) {
      return normalizeV2(parsed as CapsulesStateV2)
    }
  } catch {
    // fall through
  }
  return emptyCapsulesV2()
}

export function persistCapsulesState(state: CapsulesStateV2): void {
  localStorage.setItem(KEYS.FAVOURITES, JSON.stringify(state))
}

function allEntries(state: CapsulesStateV2): CapsuleSavedEntry[] {
  const fromPresets = PRESET_CAPSULE_ORDER.flatMap((id) => state.presets[id])
  const fromCustom = state.customCapsules.flatMap((c) => c.entries)
  return [...fromPresets, ...fromCustom]
}

/** Flat list of every saved look (any capsule) — for Home “already saved” checks. */
export function getAllCapsuleEntries(): CapsuleSavedEntry[] {
  return allEntries(loadCapsulesState())
}

/** @deprecated Prefer getAllCapsuleEntries — same shape for backward compatibility */
export function getFavourites(): FavouriteOutfit[] {
  return getAllCapsuleEntries().map(({ outfit, savedAt }) => ({ outfit, savedAt }))
}

export function saveFavourites(_favourites: FavouriteOutfit[]): void {
  void _favourites
  console.warn('saveFavourites is deprecated; use persistCapsulesState / saveOutfitToCapsule')
}

export type SaveToCapsuleOptions = {
  occasion?: Occasion
  /** Preset id (e.g. office) or custom capsule id (custom-…) */
  capsuleId?: string
  harmonyScore?: number
}

/**
 * Save a look into a capsule. Skips if the same wardrobe combination exists anywhere in Capsule.
 * Target capsule: explicit `capsuleId`, else mapped from `occasion`, else from outfit.occasion.
 */
export function saveOutfitToCapsule(outfit: Outfit, options?: SaveToCapsuleOptions): boolean {
  const state = loadCapsulesState()
  const sig = outfitSignature(outfit)
  if (allEntries(state).some((e) => outfitSignature(e.outfit) === sig)) return false

  const entry: CapsuleSavedEntry = {
    outfit,
    savedAt: new Date().toISOString(),
    harmonyScore: options?.harmonyScore,
  }

  let target = options?.capsuleId
  if (!target) {
    target = presetCapsuleIdFromOccasion(options?.occasion ?? outfit.occasion)
  }

  if (PRESET_CAPSULE_ORDER.includes(target as PresetCapsuleId)) {
    state.presets[target as PresetCapsuleId].push(entry)
  } else {
    const cap = state.customCapsules.find((c) => c.id === target)
    if (!cap) {
      state.presets.everyday.push(entry)
    } else {
      cap.entries.push(entry)
    }
  }

  persistCapsulesState(state)
  return true
}

/** @deprecated Use saveOutfitToCapsule */
export function saveFavouriteBySignature(outfit: Outfit, options?: SaveToCapsuleOptions): boolean {
  return saveOutfitToCapsule(outfit, options)
}

export function createCustomCapsule(name: string): string {
  const trimmed = name.trim()
  const state = loadCapsulesState()
  const id = `custom-${crypto.randomUUID()}`
  state.customCapsules.push({
    id,
    name: trimmed || 'My capsule',
    createdAt: new Date().toISOString(),
    entries: [],
  })
  persistCapsulesState(state)
  return id
}

export function removeCapsuleEntry(capsuleId: string, outfitId: string): void {
  const state = loadCapsulesState()
  const pred = (e: CapsuleSavedEntry) => e.outfit.id !== outfitId

  if (PRESET_CAPSULE_ORDER.includes(capsuleId as PresetCapsuleId)) {
    state.presets[capsuleId as PresetCapsuleId] = state.presets[capsuleId as PresetCapsuleId].filter(pred)
  } else {
    const cap = state.customCapsules.find((c) => c.id === capsuleId)
    if (cap) cap.entries = cap.entries.filter(pred)
  }
  persistCapsulesState(state)
}

export function markCapsuleOutfitWorn(capsuleId: string, outfitId: string): void {
  const state = loadCapsulesState()
  const now = new Date().toISOString()
  const mark = (entries: CapsuleSavedEntry[]) => {
    const e = entries.find((x) => x.outfit.id === outfitId)
    if (e) e.lastWornAt = now
  }
  if (PRESET_CAPSULE_ORDER.includes(capsuleId as PresetCapsuleId)) {
    mark(state.presets[capsuleId as PresetCapsuleId])
  } else {
    const cap = state.customCapsules.find((c) => c.id === capsuleId)
    if (cap) mark(cap.entries)
  }
  persistCapsulesState(state)
}

export function deleteCustomCapsule(capsuleId: string): void {
  if (!capsuleId.startsWith('custom-')) return
  const state = loadCapsulesState()
  state.customCapsules = state.customCapsules.filter((c) => c.id !== capsuleId)
  persistCapsulesState(state)
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

export interface HairStyleNote {
  id: string
  text: string
  savedAt: string
}

export function getHairStyleNotes(): HairStyleNote[] {
  try {
    const raw = localStorage.getItem(KEYS.HAIR_STYLE_NOTES)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => x && typeof (x as HairStyleNote).text === 'string') as HairStyleNote[]
  } catch {
    return []
  }
}

export function appendHairStyleNote(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) return
  const list = getHairStyleNotes()
  list.push({
    id: `hair-note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed,
    savedAt: new Date().toISOString(),
  })
  localStorage.setItem(KEYS.HAIR_STYLE_NOTES, JSON.stringify(list))
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
