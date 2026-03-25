import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClothingItem } from './WardrobeSelector'
import { User } from 'lucide-react'
import { DesignRoomCutoutImage } from './DesignRoomCutoutImage'

export type OutfitSlot = 'accessories' | 'outerwear' | 'tops' | 'bottoms' | 'shoes'

interface OutfitCanvasProps {
  selectedItems: { [key: string]: ClothingItem | null }
}

/** Initial layout — spread across the canvas (percent of container, center anchor). */
const DEFAULT_POS: Record<OutfitSlot, { x: number; y: number }> = {
  accessories: { x: 78, y: 14 },
  outerwear: { x: 50, y: 16 },
  tops: { x: 32, y: 26 },
  bottoms: { x: 52, y: 52 },
  shoes: { x: 22, y: 72 },
}

const SLOT_ORDER: OutfitSlot[] = ['accessories', 'outerwear', 'tops', 'bottoms', 'shoes']

const SIZE_PX: Record<OutfitSlot, { w: number; h: number }> = {
  accessories: { w: 100, h: 100 },
  outerwear: { w: 130, h: 130 },
  tops: { w: 150, h: 150 },
  bottoms: { w: 150, h: 150 },
  shoes: { w: 120, h: 120 },
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function posKey(slot: OutfitSlot, item: ClothingItem) {
  return `${slot}:${item.id}`
}

export function OutfitCanvas({ selectedItems }: OutfitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [zStack, setZStack] = useState<OutfitSlot[]>([])

  const hasAnyItem = Object.values(selectedItems).some((item) => item !== null)

  /* Reset / seed positions when an item appears or changes in a slot */
  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev }
      const validKeys = new Set<string>()
      for (const slot of SLOT_ORDER) {
        const item = selectedItems[slot]
        if (!item) continue
        const k = posKey(slot, item)
        validKeys.add(k)
        if (next[k] === undefined) {
          next[k] = { ...DEFAULT_POS[slot] }
        }
      }
      for (const key of Object.keys(next)) {
        if (!validKeys.has(key)) delete next[key]
      }
      return next
    })
  }, [selectedItems])

  const bringToFront = useCallback((slot: OutfitSlot) => {
    setZStack((prev) => {
      const rest = prev.filter((s) => s !== slot)
      return [...rest, slot]
    })
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, slot: OutfitSlot) => {
      const item = selectedItems[slot]
      if (!item || !containerRef.current) return
      e.preventDefault()
      bringToFront(slot)

      const k = posKey(slot, item)
      const rect = containerRef.current.getBoundingClientRect()
      const start = positions[k] ?? DEFAULT_POS[slot]
      const drag = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: start.x,
        startY: start.y,
      }

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== drag.pointerId) return
        const dx = ev.clientX - drag.startClientX
        const dy = ev.clientY - drag.startClientY
        const nx = drag.startX + (dx / rect.width) * 100
        const ny = drag.startY + (dy / rect.height) * 100
        setPositions((p) => ({
          ...p,
          [k]: { x: clamp(nx, 6, 94), y: clamp(ny, 6, 94) },
        }))
      }

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== drag.pointerId) return
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [selectedItems, positions, bringToFront]
  )

  const zForSlot = (slot: OutfitSlot) => {
    const i = zStack.indexOf(slot)
    if (i >= 0) return 20 + i
    return SLOT_ORDER.indexOf(slot)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={containerRef}
        className="flex-1 relative design-room-garment-surface min-h-[260px] w-full overflow-hidden select-none"
      >
        {!hasAnyItem ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-8 z-[5] pointer-events-none">
            <User size={64} className="mx-auto mb-4 text-white drop-shadow-md" strokeWidth={1} aria-hidden />
            <p className="text-sm text-white drop-shadow-md leading-relaxed">
              Select items from your wardrobe
              <br />
              then drag them anywhere on this board
            </p>
          </div>
        ) : (
          SLOT_ORDER.map((slot) => {
            const item = selectedItems[slot]
            if (!item) return null
            const k = posKey(slot, item)
            const pos = positions[k] ?? DEFAULT_POS[slot]
            const size = SIZE_PX[slot]
            const z = zForSlot(slot)

            return (
              <div
                key={k}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: size.w,
                  height: size.h,
                  zIndex: z,
                  touchAction: 'none',
                }}
                onPointerDown={(e) => handlePointerDown(e, slot)}
                role="img"
                aria-label={`${item.name} — drag to move`}
              >
                <div
                  className="design-room-garment-surface w-full h-full rounded-sm overflow-hidden border-2 border-black/40 shadow-inner"
                  style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.35)' }}
                >
                  <DesignRoomCutoutImage
                    src={item.image}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
                <div className="text-[10px] text-center mt-0.5 text-white drop-shadow-md font-bold truncate max-w-[140px] mx-auto">
                  {item.name}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
