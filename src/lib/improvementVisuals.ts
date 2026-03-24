import type { ColourGroup } from '@/types'
import type { OutfitImprovementSuggestion } from '@/lib/outfitImprovements'
import { colourGroupToSwatches } from '@/lib/colourSwatches'

/** Thumbnails and palette dots for the before/after dummy under “Improve this outfit”. */
export function getEnhanceVisualsFromImprovements(improvements: OutfitImprovementSuggestion): {
  addImages: string[]
  swatches: [string, string, string]
} {
  const addImages: string[] = []
  let firstColour: ColourGroup | undefined
  for (const d of improvements.directions) {
    for (const a of d.actions) {
      if (a.type === 'add') {
        const img = a.imageUrl || a.inspirationImageUrl
        if (img && !addImages.includes(img)) addImages.push(img)
      }
      if (firstColour === undefined && a.colourGroup) firstColour = a.colourGroup
    }
  }
  return {
    addImages: addImages.slice(0, 3),
    swatches: colourGroupToSwatches(firstColour ?? 'neutral'),
  }
}
