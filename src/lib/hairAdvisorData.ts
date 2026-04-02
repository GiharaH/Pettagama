import type { HairNecklineKey } from '@/types'

export interface HairStyleCardData {
  id: string
  name: string
  reason: string
}

export interface HairAdvisorNecklineContent {
  /** Sidebar + detected label */
  displayLabel: string
  topPick: HairStyleCardData
  also: [HairStyleCardData, HairStyleCardData]
  avoid: string
}

/** Sidebar order and keys (must match HairNecklineKey). */
export const HAIR_ADVISOR_NECKLINE_ORDER: { key: HairNecklineKey; sidebarLabel: string }[] = [
  { key: 'crew_round', sidebarLabel: 'Crew/Round' },
  { key: 'off_shoulder', sidebarLabel: 'Off-Shoulder' },
  { key: 'turtleneck', sidebarLabel: 'Turtleneck' },
  { key: 'strapless', sidebarLabel: 'Strapless' },
  { key: 'square_neck', sidebarLabel: 'Square Neck' },
  { key: 'halter_keyhole', sidebarLabel: 'Halter/Keyhole' },
  { key: 'v_neck_deep', sidebarLabel: 'V-Neck/Deep' },
]

export const HAIR_ADVISOR_BY_NECKLINE: Record<HairNecklineKey, HairAdvisorNecklineContent> = {
  crew_round: {
    displayLabel: 'Crew / Round neckline',
    topPick: {
      id: 'cr_high_ponytail',
      name: 'High ponytail',
      reason: 'Lifts hair off the collar so the round neck reads clean and open.',
    },
    also: [
      {
        id: 'top_knot_bun',
        name: 'Top knot bun',
        reason: 'Keeps volume high and balances the horizontal line of a crew neck.',
      },
      {
        id: 'cr_half_up',
        name: 'Half-up',
        reason: 'Shows the neckline while adding softness around the face.',
      },
    ],
    avoid: 'low voluminous buns',
  },
  off_shoulder: {
    displayLabel: 'Off-shoulder neckline',
    topPick: {
      id: 'os_loose_waves',
      name: 'Loose waves',
      reason: 'Frames shoulders and collarbone without competing with the bare neckline.',
    },
    also: [
      {
        id: 'os_low_bun',
        name: 'Low bun',
        reason: 'Keeps hair off the shoulders while staying soft and romantic.',
      },
      {
        id: 'os_side_swept',
        name: 'Side swept',
        reason: 'Asymmetric flow draws the eye along the exposed shoulder line.',
      },
    ],
    avoid: 'tight high ponytails',
  },
  turtleneck: {
    displayLabel: 'Turtleneck',
    topPick: {
      id: 'tk_sleek_bun',
      name: 'Sleek bun',
      reason: 'Vertical stack from neck up—no bulk fighting the high collar.',
    },
    also: [
      {
        id: 'tk_high_ponytail',
        name: 'High ponytail',
        reason: 'Pulls everything up so the turtleneck stays the focal point.',
      },
      {
        id: 'tk_updo_twist',
        name: 'Updo twist',
        reason: 'Structured height pairs with a covered neck for a polished silhouette.',
      },
    ],
    avoid: 'hair fully down',
  },
  strapless: {
    displayLabel: 'Strapless neckline',
    topPick: {
      id: 'st_high_updo',
      name: 'High updo',
      reason: 'Opens the décolletage and elongates the neck with no straps.',
    },
    also: [
      {
        id: 'st_sleek_ponytail',
        name: 'Sleek ponytail',
        reason: 'Clean line from crown to shoulders keeps the look formal.',
      },
      {
        id: 'st_low_chignon',
        name: 'Low chignon',
        reason: 'Classic counterweight when you want hair off the upper chest.',
      },
    ],
    avoid: 'half-up styles',
  },
  square_neck: {
    displayLabel: 'Square neck',
    topPick: {
      id: 'sq_half_up_waves',
      name: 'Half-up waves',
      reason: 'Softens the angular corners of the square while showing the shape.',
    },
    also: [
      {
        id: 'sq_low_ponytail',
        name: 'Low ponytail',
        reason: 'Simple tail at the nape echoes the straight horizontal edge.',
      },
      {
        id: 'sq_side_braid',
        name: 'Side braid',
        reason: 'Diagonal interest balances the geometric neckline.',
      },
    ],
    avoid: 'severe centre part',
  },
  halter_keyhole: {
    displayLabel: 'Halter / Keyhole neckline',
    topPick: {
      id: 'hk_high_bun',
      name: 'High bun',
      reason: 'Keeps back and shoulders clear for halter ties and keyhole cutouts.',
    },
    also: [
      {
        id: 'hk_high_ponytail',
        name: 'High ponytail',
        reason: 'Shows off shoulder blades and the halter silhouette.',
      },
      {
        id: 'hk_braided_updo',
        name: 'Braided updo',
        reason: 'Texture up top without hair falling onto the chest or back.',
      },
    ],
    avoid: 'all hair down',
  },
  v_neck_deep: {
    displayLabel: 'V-neck / deep V',
    topPick: {
      id: 'vn_loose_waves',
      name: 'Loose waves',
      reason: 'Soft volume mirrors the V and fills space without hiding the point.',
    },
    also: [
      {
        id: 'vn_low_side_bun',
        name: 'Low side bun',
        reason: 'Asymmetric mass balances a deep V without covering it.',
      },
      {
        id: 'vn_curtain_fringe',
        name: 'Curtain fringe',
        reason: 'Face-framing pieces lead the eye toward the V’s focal point.',
      },
    ],
    avoid: 'sleek straight centre part',
  },
}
