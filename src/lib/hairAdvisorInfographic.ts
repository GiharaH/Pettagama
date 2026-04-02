import type { HairNecklineKey } from '@/types'

/** Source asset: neckline × hairstyle grid (realistic reference). */
export const HAIR_ADVISOR_INFOGRAPHIC_SRC = '/hair-advisor-infographic.png'

/** Pixel dimensions of `hair-advisor-infographic.png`. */
export const INFOGRAPHIC_IMG = { w: 686, h: 1024 } as const

const ROWS = 7
const COLS = 3

/**
 * Left fraction of image width used by garment + arrow; portraits occupy the remainder in 3 columns.
 * Tuned for 686×1024 reference art.
 */
const OFF_X_FRAC = 0.33

const offX = INFOGRAPHIC_IMG.w * OFF_X_FRAC
export const PORTRAIT_CELL = {
  w: (INFOGRAPHIC_IMG.w - offX) / COLS,
  h: INFOGRAPHIC_IMG.h / ROWS,
  offX,
} as const

/**
 * Map app neckline → row index in the infographic (0 = boat/bateau … 6 = halter).
 * Crew/round → boat row; V-neck / deep V → sweetheart row (closest curve).
 */
export const NECKLINE_TO_INFOGRAPHIC_ROW: Record<HairNecklineKey, number> = {
  crew_round: 0,
  off_shoulder: 1,
  turtleneck: 2,
  strapless: 3,
  square_neck: 4,
  v_neck_deep: 5,
  halter_keyhole: 6,
}

export function infographicRowForNeckline(key: HairNecklineKey): number {
  return NECKLINE_TO_INFOGRAPHIC_ROW[key]
}
