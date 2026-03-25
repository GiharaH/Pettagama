/**
 * Shared style scoring for Design Room and anywhere else we persist a harmony grade.
 * Mirrors the logic previously embedded in StylingFeedback.
 */

export interface DesignRoomScoreItem {
  color: string
  style: string
}

export interface StyleAnalysis {
  score: number
  colorHarmony: number
  styleConsistency: number
  balance: number
  feedback: string[]
  suggestions: string[]
}

export interface DesignRoomSlotsFilled {
  hasTop: boolean
  hasBottom: boolean
  hasShoes: boolean
}

export function analyzeDesignRoomItems(
  items: DesignRoomScoreItem[],
  slots: DesignRoomSlotsFilled
): StyleAnalysis {
  if (items.length === 0) {
    return {
      score: 0,
      colorHarmony: 0,
      styleConsistency: 0,
      balance: 0,
      feedback: ['Select items to get styling feedback'],
      suggestions: [],
    }
  }

  const colors = items.map((item) => item.color.toLowerCase())
  const colorSet = new Set(colors)
  let colorHarmony = 100

  if (colorSet.size > 3) {
    colorHarmony -= (colorSet.size - 3) * 15
  }

  const hasNeutral = colors.some((c) => ['black', 'white', 'gray', 'beige', 'navy'].includes(c))
  if (hasNeutral) colorHarmony += 10

  const styles = items.map((item) => item.style.toLowerCase())
  const styleSet = new Set(styles)
  let styleConsistency = 100

  if (styleSet.size > 2) {
    styleConsistency -= (styleSet.size - 2) * 20
  }

  let balance = 50
  if (slots.hasTop) balance += 20
  if (slots.hasBottom) balance += 20
  if (slots.hasShoes) balance += 10

  const score = Math.round((colorHarmony + styleConsistency + balance) / 3)

  const feedback: string[] = []
  const suggestions: string[] = []

  if (score >= 85) {
    feedback.push('Outstanding! This outfit is well-coordinated.')
  } else if (score >= 70) {
    feedback.push('Great outfit! Minor tweaks could perfect it.')
  } else if (score >= 50) {
    feedback.push('Good start. Consider these improvements:')
  } else {
    feedback.push('Needs work. Try these suggestions:')
  }

  if (colorHarmony < 70) {
    suggestions.push('Try limiting to 2-3 colors for better harmony')
  }
  if (!hasNeutral && colors.length > 1) {
    suggestions.push('Add a neutral piece to balance bold colors')
  }

  if (styleConsistency < 70) {
    suggestions.push('Mix styles carefully - keep one dominant theme')
  }

  if (!slots.hasTop || !slots.hasBottom) {
    suggestions.push('Complete the outfit with essential pieces')
  }
  if (!slots.hasShoes && items.length >= 2) {
    suggestions.push('Add shoes to complete the look')
  }

  if (hasNeutral && colorSet.size <= 3) {
    feedback.push('Excellent color coordination!')
  }
  if (styleSet.size === 1) {
    feedback.push('Perfect style consistency!')
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    colorHarmony: Math.min(100, Math.max(0, colorHarmony)),
    styleConsistency: Math.min(100, Math.max(0, styleConsistency)),
    balance: Math.min(100, Math.max(0, balance)),
    feedback,
    suggestions,
  }
}
