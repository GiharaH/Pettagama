import type { ClothingItem } from './WardrobeSelector'
import { User } from 'lucide-react'

interface OutfitCanvasProps {
  selectedItems: { [key: string]: ClothingItem | null }
}

export function OutfitCanvas({ selectedItems }: OutfitCanvasProps) {
  const hasAnyItem = Object.values(selectedItems).some((item) => item !== null)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-gray-50 to-gray-100">
        {!hasAnyItem ? (
          <div className="text-center">
            <User size={64} className="mx-auto mb-4 text-gray-400" strokeWidth={1} />
            <p className="text-sm text-gray-600">
              Select items from your wardrobe
              <br />
              to create an outfit
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md p-4 space-y-4">
            <div className="space-y-3">
              {selectedItems.accessories && (
                <div className="flex justify-center">
                  <div className="border-2 border-black bg-white p-2" style={{ boxShadow: '3px 3px 0px black' }}>
                    <img
                      src={selectedItems.accessories.image}
                      alt={selectedItems.accessories.name}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="text-xs text-center mt-1 border-t border-black pt-1">
                      {selectedItems.accessories.name}
                    </div>
                  </div>
                </div>
              )}

              {selectedItems.outerwear && (
                <div className="flex justify-center">
                  <div className="border-2 border-black bg-white p-2" style={{ boxShadow: '3px 3px 0px black' }}>
                    <img
                      src={selectedItems.outerwear.image}
                      alt={selectedItems.outerwear.name}
                      className="w-32 h-32 object-cover"
                    />
                    <div className="text-xs text-center mt-1 border-t border-black pt-1">
                      {selectedItems.outerwear.name}
                    </div>
                  </div>
                </div>
              )}

              {selectedItems.tops && (
                <div className="flex justify-center">
                  <div className="border-2 border-black bg-white p-2" style={{ boxShadow: '3px 3px 0px black' }}>
                    <img
                      src={selectedItems.tops.image}
                      alt={selectedItems.tops.name}
                      className="w-40 h-40 object-cover"
                    />
                    <div className="text-xs text-center mt-1 border-t border-black pt-1">
                      {selectedItems.tops.name}
                    </div>
                  </div>
                </div>
              )}

              {selectedItems.bottoms && (
                <div className="flex justify-center">
                  <div className="border-2 border-black bg-white p-2" style={{ boxShadow: '3px 3px 0px black' }}>
                    <img
                      src={selectedItems.bottoms.image}
                      alt={selectedItems.bottoms.name}
                      className="w-40 h-40 object-cover"
                    />
                    <div className="text-xs text-center mt-1 border-t border-black pt-1">
                      {selectedItems.bottoms.name}
                    </div>
                  </div>
                </div>
              )}

              {selectedItems.shoes && (
                <div className="flex justify-center">
                  <div className="border-2 border-black bg-white p-2" style={{ boxShadow: '3px 3px 0px black' }}>
                    <img
                      src={selectedItems.shoes.image}
                      alt={selectedItems.shoes.name}
                      className="w-32 h-32 object-cover"
                    />
                    <div className="text-xs text-center mt-1 border-t border-black pt-1">
                      {selectedItems.shoes.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
