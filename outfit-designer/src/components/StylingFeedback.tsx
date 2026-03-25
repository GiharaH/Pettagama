import type { ClothingItem } from './WardrobeSelector'
import { Star, Sparkles, Save, Eye } from 'lucide-react'
import { analyzeDesignRoomItems, type StyleAnalysis } from '@/lib/styleScore'

interface StylingFeedbackProps {
  selectedItems: { [key: string]: ClothingItem | null }
  onSaveOutfit: () => void
  onViewCapsule: () => void
}

function analyzeOutfit(selectedItems: { [key: string]: ClothingItem | null }): StyleAnalysis {
  const items = Object.values(selectedItems)
    .filter((item): item is ClothingItem => item !== null)
    .map((item) => ({ color: item.color, style: item.style }))

  return analyzeDesignRoomItems(items, {
    hasTop: selectedItems.tops !== null,
    hasBottom: selectedItems.bottoms !== null,
    hasShoes: selectedItems.shoes !== null,
  })
}

const MIN_ITEMS_FOR_FEEDBACK = 3

export function StylingFeedback({ selectedItems, onSaveOutfit, onViewCapsule }: StylingFeedbackProps) {
  const itemCount = Object.values(selectedItems).filter((item): item is ClothingItem => item !== null).length
  const showStyleFeedback = itemCount >= MIN_ITEMS_FOR_FEEDBACK
  const analysis = showStyleFeedback ? analyzeOutfit(selectedItems) : null
  const hasItems = itemCount > 0

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700'
    if (score >= 70) return 'text-blue-700'
    if (score >= 50) return 'text-yellow-700'
    return 'text-red-700'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Great'
    if (score >= 50) return 'Good'
    return 'Needs Work'
  }

  return (
    <div className="flex flex-col h-full">
      {!showStyleFeedback ? (
        <div
          className="border-2 border-black bg-gray-50 p-4 mb-3 flex-1 flex flex-col justify-center text-center"
          style={{ boxShadow: '3px 3px 0px black' }}
        >
          <Sparkles size={22} className="mx-auto mb-2 opacity-60" aria-hidden />
          <p className="font-bold text-sm mb-1">Style feedback unlocks soon</p>
          <p className="text-xs leading-relaxed text-gray-700">
            Add at least <span className="font-bold">{MIN_ITEMS_FOR_FEEDBACK} pieces</span> from your wardrobe to complete the look — then we&apos;ll score color harmony, consistency, and balance.
          </p>
          <p className="text-xs mt-3 font-mono border border-dashed border-black inline-block mx-auto px-2 py-1 bg-white">
            {itemCount} / {MIN_ITEMS_FOR_FEEDBACK} selected
          </p>
        </div>
      ) : (
        <>
          <div className="border-2 border-black bg-white p-3 mb-3" style={{ boxShadow: '3px 3px 0px black' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="font-bold">Style Score</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(analysis!.score)}`}>{analysis!.score}</div>
            </div>
            <div className="text-xs text-center border border-black px-2 py-1 bg-gray-50">{getScoreLabel(analysis!.score)}</div>
          </div>

          <div className="space-y-2 mb-3">
            <MetricBar label="Color Harmony" value={analysis!.colorHarmony} />
            <MetricBar label="Style Consistency" value={analysis!.styleConsistency} />
            <MetricBar label="Balance" value={analysis!.balance} />
          </div>

          <div
            className="border-2 border-black bg-white p-2 mb-3 flex-1 overflow-y-auto"
            style={{ boxShadow: '2px 2px 0px black' }}
          >
            <div className="text-xs space-y-2">
              {analysis!.feedback.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Star size={12} className="flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}

              {analysis!.suggestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-black">
                  <div className="font-bold mb-1">Suggestions:</div>
                  {analysis!.suggestions.map((suggestion, index) => (
                    <div key={index} className="ml-2 mb-1">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={onSaveOutfit}
          disabled={!hasItems}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black transition-colors touch-manipulation ${
            hasItems
              ? 'bg-black text-white hover:bg-gray-800 active:bg-gray-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ boxShadow: '3px 3px 0px black' }}
        >
          <Save size={16} />
          <span>Save to Capsule</span>
        </button>

        <button
          type="button"
          onClick={onViewCapsule}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-white text-black hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
          style={{ boxShadow: '3px 3px 0px black' }}
        >
          <Eye size={16} />
          <span>View Capsule Wardrobe</span>
        </button>
      </div>
    </div>
  )
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-black bg-white p-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="border border-black bg-gray-100 h-2">
        <div className="h-full bg-black transition-all duration-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
