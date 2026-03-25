import { useEffect, useState } from 'react'
import { getGarmentCutoutObjectUrl } from '@/lib/garmentCutoutCache'

interface GarmentCutoutImageProps {
  src: string
  alt?: string
  className?: string
}

/**
 * Renders a wardrobe image with background removed for flat-lay / cutout display.
 * Falls back to the original `src` if removal fails (CORS, unsupported source, etc.).
 */
export function GarmentCutoutImage({ src, alt = '', className }: GarmentCutoutImageProps) {
  const [href, setHref] = useState(src)

  useEffect(() => {
    let cancelled = false
    setHref(src)
    getGarmentCutoutObjectUrl(src).then((url) => {
      if (!cancelled) setHref(url)
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return <img src={href} alt={alt} className={className} decoding="async" />
}
