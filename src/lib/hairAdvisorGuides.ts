import type { HairNecklineKey } from '@/types'

export type HairLengthChoice = 'short' | 'medium' | 'long'

/** 12 texture cells: row-major 1A–1C, 2A–2C, … 4C */
export type HairTextureIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export const HAIR_TEXTURE_LABELS = [
  '1A',
  '1B',
  '1C',
  '2A',
  '2B',
  '2C',
  '3A',
  '3B',
  '3C',
  '4A',
  '4B',
  '4C',
] as const

export const SHORT_GUIDE = {
  src: '/hair-advisor-short-guide.png',
  w: 682,
  h: 1024,
  rows: 8,
  cols: 2,
} as const

export const LONG_GUIDE = {
  src: '/hair-advisor-long-guide.png',
  w: 644,
  h: 1024,
  rows: 8,
  cols: 2,
} as const

export const TEXTURE_GUIDE = {
  src: '/hair-advisor-texture-guide.png',
  w: 682,
  h: 1024,
  rows: 4,
  cols: 3,
} as const

/** Same 8-row order in short & long charts: V, High, Scoop, Asymmetric, Square, Queen Anne, Sweetheart, Straight across */
export const GUIDE_ROW_BY_NECKLINE: Record<HairNecklineKey, number> = {
  v_neck_deep: 0,
  turtleneck: 1,
  crew_round: 2,
  off_shoulder: 3,
  square_neck: 4,
  halter_keyhole: 5,
  strapless: 7,
}

export function guideRowForNeckline(key: HairNecklineKey): number {
  return GUIDE_ROW_BY_NECKLINE[key]
}

/** Recommended style titles from “Short hairstyle & recommended necklines” */
export const SHORT_GUIDE_STYLE_NAMES: string[] = [
  'Side parted short bob',
  'Side parted jerry curl short',
  'Centre parted bob (behind ears)',
  'Side parted wavy short',
  'Side parted short bob',
  'Centre parted bob (behind ears)',
  'Side parted wavy short',
  'Side parted wavy short',
]

/** Recommended style titles from “Different neckline & recommended hair styles” */
export const LONG_GUIDE_STYLE_NAMES: string[] = [
  'Half up, half down',
  'High bun',
  'High pony — shoulder drop',
  'Low pony behind',
  'Low pony',
  'High bun',
  'Side part, hair down',
  'Centre part, hair down',
]

export function shortLongStyleName(length: 'short' | 'long', row: number): string {
  const list = length === 'short' ? SHORT_GUIDE_STYLE_NAMES : LONG_GUIDE_STYLE_NAMES
  return list[row] ?? 'Recommended style'
}

export function textureRowCol(index: HairTextureIndex): { row: number; col: number } {
  return { row: Math.floor(index / 3), col: index % 3 }
}
