import { Shirt, Layers, Footprints, PackageOpen, Watch } from 'lucide-react'

export interface ClothingItem {
  id: string
  name: string
  category: string
  image: string
  color: string
  style: string
  tags: string[]
}

interface WardrobeSelectorProps {
  items: ClothingItem[]
  selectedCategory: string
  selectedItems: { [key: string]: ClothingItem | null }
  onCategorySelect: (category: string) => void
  onItemSelect: (category: string, item: ClothingItem) => void
}

const categories = [
  { id: 'tops', name: 'Tops', icon: Shirt },
  { id: 'bottoms', name: 'Bottoms', icon: Layers },
  { id: 'shoes', name: 'Shoes', icon: Footprints },
  { id: 'outerwear', name: 'Outerwear', icon: PackageOpen },
  { id: 'accessories', name: 'Accessories', icon: Watch },
]

export function WardrobeSelector({
  items,
  selectedCategory,
  selectedItems,
  onCategorySelect,
  onItemSelect,
}: WardrobeSelectorProps) {
  const categoryItems = items.filter((item) => item.category === selectedCategory)

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-1 mb-3">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategorySelect(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 border border-black text-sm transition-colors touch-manipulation min-h-[44px] ${
                isSelected ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200 active:bg-gray-300'
              }`}
              style={{ boxShadow: '2px 2px 0px black' }}
            >
              <Icon size={16} />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {categoryItems.map((item) => {
            const isSelected = selectedItems[selectedCategory]?.id === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemSelect(selectedCategory, item)}
                className={`border border-black overflow-hidden transition-all touch-manipulation min-h-[80px] ${
                  isSelected ? 'ring-4 ring-black' : 'hover:opacity-80 active:opacity-60'
                }`}
                style={{
                  boxShadow: isSelected ? '3px 3px 0px black' : '2px 2px 0px black',
                }}
              >
                <div className="aspect-square relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div
                  className={`p-1 text-xs border-t border-black ${
                    isSelected ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {item.name}
                </div>
              </button>
            )
          })}
        </div>

        {categoryItems.length === 0 && (
          <div className="text-center text-sm text-gray-600 mt-4">
            No items in this category yet.
            <br />
            Add pieces in Pettagama Wardrobe first.
          </div>
        )}
      </div>
    </div>
  )
}
