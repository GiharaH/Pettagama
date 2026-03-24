import type { ColourGroup } from '@/types'

/** Three palette dots for UI (before/after “suggested colours”). */
export function colourGroupToSwatches(g: ColourGroup): [string, string, string] {
  const map: Record<ColourGroup, [string, string, string]> = {
    neutral: ['#f5e6d3', '#c4a574', '#8b7355'],
    pastel: ['#fceef8', '#e8d4e6', '#b8a9c9'],
    earth: ['#d4c4a8', '#6b5344', '#3d5c3a'],
    warm: ['#e8c4a0', '#c4785a', '#8b4513'],
    cool: ['#e2e8ec', '#5c6b73', '#2c3e42'],
    jewel: ['#9b4d96', '#1a5f7a', '#2d6a4f'],
    black_white: ['#f5f5f0', '#6b6b6b', '#1a1a1a'],
  }
  return map[g] ?? map.neutral
}
