/**
 * Lazy background removal for wardrobe/capsule imagery (same engine as Add Item).
 * Caches object URLs per source so scrolling capsules does not re-run inference.
 */

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

let preloadPromise: Promise<void> | null = null

export function preloadGarmentBackgroundRemoval(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = import('@imgly/background-removal')
      .then(({ preload }) => preload())
      .catch(() => undefined)
  }
  return preloadPromise
}

/**
 * Returns a blob: object URL with background removed, or the original `imageSrc` on failure.
 */
export function getGarmentCutoutObjectUrl(imageSrc: string): Promise<string> {
  const hit = cache.get(imageSrc)
  if (hit) return Promise.resolve(hit)

  const pending = inflight.get(imageSrc)
  if (pending) return pending

  const task = (async () => {
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      await preloadGarmentBackgroundRemoval()
      const blob = await removeBackground(imageSrc)
      const url = URL.createObjectURL(blob)
      cache.set(imageSrc, url)
      return url
    } catch {
      cache.set(imageSrc, imageSrc)
      return imageSrc
    } finally {
      inflight.delete(imageSrc)
    }
  })()

  inflight.set(imageSrc, task)
  return task
}
