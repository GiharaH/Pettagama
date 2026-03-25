import { useEffect, useState } from 'react'
import { getGarmentCutoutObjectUrl } from '@/lib/garmentCutoutCache'

/**
 * Wardrobe photos with backgrounds removed for Design Room (same pipeline as Capsule flat-lay).
 */
export function DesignRoomCutoutImage({
  src,
  alt,
  className,
  draggable = false,
}: {
  src: string
  alt: string
  className?: string
  draggable?: boolean
}) {
  const [href, setHref] = useState(src)

  useEffect(() => {
    setHref(src)
    getGarmentCutoutObjectUrl(src).then(setHref)
  }, [src])

  return <img src={href} alt={alt} className={className} decoding="async" draggable={draggable} />
}
