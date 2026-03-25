import { useState, useEffect } from 'react'
import { WardrobeSelector, type ClothingItem } from './components/WardrobeSelector'
import { OutfitCanvas } from './components/OutfitCanvas'
import { StylingFeedback } from './components/StylingFeedback'
import { CapsuleWardrobeModal, type SavedOutfit } from './components/CapsuleWardrobeModal'
import { RotateCcw, ChevronLeft } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { getWardrobe } from '@/lib/storage'
import { mapWardrobeToDesignRoomItems } from './mapWardrobeItems'
import './styles/globals.css'

const CAPSULE_STORAGE_KEY = 'pettagama_design_room_capsule'

export default function DesignRoomApp({ onBack }: { onBack?: () => void }) {
  const wardrobeItems = mapWardrobeToDesignRoomItems(getWardrobe())

  const [selectedCategory, setSelectedCategory] = useState('tops')
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: ClothingItem | null }>({
    tops: null,
    bottoms: null,
    shoes: null,
    outerwear: null,
    accessories: null,
  })
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CAPSULE_STORAGE_KEY)
    if (saved) {
      try {
        setSavedOutfits(JSON.parse(saved) as SavedOutfit[])
      } catch (e) {
        console.error('Failed to load saved outfits', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CAPSULE_STORAGE_KEY, JSON.stringify(savedOutfits))
  }, [savedOutfits])

  const handleItemSelect = (category: string, item: ClothingItem) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: prev[category]?.id === item.id ? null : item,
    }))
  }

  const handleSaveOutfit = () => {
    const itemCount = Object.values(selectedItems).filter((item) => item !== null).length
    if (itemCount === 0) {
      toast.error('Please select at least one item to save')
      return
    }

    const items = Object.values(selectedItems).filter((item): item is ClothingItem => item !== null)
    const colors = items.map((item) => item.color.toLowerCase())
    const colorSet = new Set(colors)
    let score = 50 + itemCount * 5
    if (colorSet.size <= 3) score += 20
    if (selectedItems.tops && selectedItems.bottoms) score += 15

    const newOutfit: SavedOutfit = {
      id: Date.now().toString(),
      name: `Outfit ${savedOutfits.length + 1}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: { ...selectedItems },
      score: Math.min(100, score),
    }

    setSavedOutfits((prev) => [...prev, newOutfit])
    toast.success('Outfit saved to your capsule wardrobe!')
  }

  const handleLoadOutfit = (outfit: SavedOutfit) => {
    setSelectedItems(outfit.items)
    toast.success('Outfit loaded!')
  }

  const handleDeleteOutfit = (id: string) => {
    setSavedOutfits((prev) => prev.filter((outfit) => outfit.id !== id))
    toast.success('Outfit deleted')
  }

  const handleClearOutfit = () => {
    setSelectedItems({
      tops: null,
      bottoms: null,
      shoes: null,
      outerwear: null,
      accessories: null,
    })
    toast.info('Outfit cleared')
  }

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-3"
      style={{ fontFamily: 'Monaco, "Lucida Console", monospace' }}
    >
      <Toaster position="top-center" />

      <div className="w-full max-w-7xl">
        <div className="bg-white border-2 border-black">
          <div className="bg-white border-b-2 border-black p-2 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1 px-2 py-1 border border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors text-xs shrink-0"
                  style={{ boxShadow: '2px 2px 0px black' }}
                  aria-label="Back to Pettagama"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <div className="flex space-x-1 shrink-0">
                <div className="w-3 h-3 bg-white border border-black" />
                <div className="w-3 h-3 bg-white border border-black" />
              </div>
              <div className="text-sm md:text-base font-bold truncate">Design Room — Outfit Designer</div>
            </div>
            <button
              type="button"
              onClick={handleClearOutfit}
              className="flex items-center gap-2 px-3 py-1 border border-black bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-xs shrink-0"
              style={{ boxShadow: '2px 2px 0px black' }}
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-3">
              <div className="border-2 border-black bg-gray-100 p-3 h-[500px] lg:h-[600px]">
                <h3 className="mb-3 border-b border-black pb-2 font-bold">Your Wardrobe</h3>
                <WardrobeSelector
                  items={wardrobeItems}
                  selectedCategory={selectedCategory}
                  selectedItems={selectedItems}
                  onCategorySelect={setSelectedCategory}
                  onItemSelect={handleItemSelect}
                />
              </div>

              <div className="border-2 border-black bg-gray-100 p-3 h-[500px] lg:h-[600px]">
                <h2 className="mb-3 border-b border-black pb-2 font-bold">Outfit Preview</h2>
                <OutfitCanvas selectedItems={selectedItems} />
              </div>

              <div className="border-2 border-black bg-gray-100 p-3 h-[500px] lg:h-[600px]">
                <h3 className="mb-3 border-b border-black pb-2 font-bold">Style Feedback</h3>
                <StylingFeedback
                  selectedItems={selectedItems}
                  onSaveOutfit={handleSaveOutfit}
                  onViewCapsule={() => setIsModalOpen(true)}
                />
              </div>
            </div>

            <div className="border-2 border-black bg-gray-100 p-2 mt-3">
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                <span>Design Room — build outfits from your Pettagama wardrobe</span>
                <span className="text-gray-600">
                  {Object.values(selectedItems).filter((item) => item !== null).length} items selected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CapsuleWardrobeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        savedOutfits={savedOutfits}
        onLoadOutfit={handleLoadOutfit}
        onDeleteOutfit={handleDeleteOutfit}
      />
    </div>
  )
}
