import type { ClothingItem } from './WardrobeSelector'
import { X, Calendar } from 'lucide-react'

export interface SavedOutfit {
  id: string
  name: string
  date: string
  items: { [key: string]: ClothingItem | null }
  score: number
}

interface CapsuleWardrobeModalProps {
  isOpen: boolean
  onClose: () => void
  savedOutfits: SavedOutfit[]
  onLoadOutfit: (outfit: SavedOutfit) => void
  onDeleteOutfit: (id: string) => void
}

export function CapsuleWardrobeModal({
  isOpen,
  onClose,
  savedOutfits,
  onLoadOutfit,
  onDeleteOutfit,
}: CapsuleWardrobeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]">
      <div
        className="bg-white border-4 border-black max-w-4xl w-full max-h-[80vh] flex flex-col"
        style={{
          boxShadow: '8px 8px 0px black',
          fontFamily: 'Monaco, "Lucida Console", monospace',
        }}
      >
        <div className="border-b-2 border-black p-4 flex justify-between items-center bg-gray-100">
          <h2 className="text-xl font-bold">Capsule Wardrobe</h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-white p-2 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            style={{ boxShadow: '2px 2px 0px black' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {savedOutfits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No saved outfits yet</p>
              <p className="text-sm text-gray-500">
                Create and save your first outfit to build your capsule wardrobe!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="border-2 border-black bg-white overflow-hidden"
                  style={{ boxShadow: '3px 3px 0px black' }}
                >
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 border-b-2 border-black">
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(outfit.items)
                        .filter((item): item is ClothingItem => item !== null)
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div key={idx} className="aspect-square border border-black">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{outfit.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar size={12} />
                          <span>{outfit.date}</span>
                        </div>
                      </div>
                      <div className="border border-black px-2 py-1 text-xs font-bold bg-gray-50">{outfit.score}</div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadOutfit(outfit)
                          onClose()
                        }}
                        className="flex-1 px-3 py-2 border border-black bg-black text-white text-xs hover:bg-gray-800 active:bg-gray-900 transition-colors"
                        style={{ boxShadow: '2px 2px 0px black' }}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOutfit(outfit.id)}
                        className="px-3 py-2 border border-black bg-white text-xs hover:bg-red-100 active:bg-red-200 transition-colors"
                        style={{ boxShadow: '2px 2px 0px black' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
