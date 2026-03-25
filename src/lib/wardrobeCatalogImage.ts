import { enhanceWardrobeImageForCatalogOpenAI } from '@/lib/ai'

/** Same baby blue as Wardrobe “Add item” pill buttons */
export const WARDROBE_CATALOG_BG = '#b8e0f2'

async function loadRemoveBackground() {
  const { removeBackground } = await import('@imgly/background-removal')
  return removeBackground
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

/** Square transparent PNG for optional OpenAI edits (DALL·E 2 expects square PNG). */
async function blobToSquareTransparentPngBlob(blob: Blob, size = 1024): Promise<Blob> {
  const bmp = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.clearRect(0, 0, size, size)
  const margin = 0.08
  const maxW = size * (1 - 2 * margin)
  const maxH = size * (1 - 2 * margin)
  const scale = Math.min(maxW / bmp.width, maxH / bmp.height)
  const dw = bmp.width * scale
  const dh = bmp.height * scale
  const x = (size - dw) / 2
  const y = (size - dh) / 2
  ctx.drawImage(bmp, x, y, dw, dh)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('PNG export failed'))),
      'image/png'
    )
  })
}

/** Draw cutout on solid baby blue (used when AI enhancement is off or fails). */
export async function compositeGarmentOnBabyBlue(cutoutBlob: Blob): Promise<string> {
  const bmp = await createImageBitmap(cutoutBlob)
  const maxSide = 1024
  const scale = Math.min(maxSide / bmp.width, maxSide / bmp.height, 1)
  const dw = Math.round(bmp.width * scale)
  const dh = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = dw
  canvas.height = dh
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.fillStyle = WARDROBE_CATALOG_BG
  ctx.fillRect(0, 0, dw, dh)
  ctx.drawImage(bmp, 0, 0, dw, dh)
  return canvas.toDataURL('image/png')
}

/**
 * Remove background in-browser, optionally refine with OpenAI image edits, else composite on baby blue.
 */
export async function processWardrobeUpload(file: File): Promise<string> {
  const removeBackground = await loadRemoveBackground()
  let cutout: Blob
  try {
    cutout = await removeBackground(file)
  } catch {
    return fileToDataUrl(file)
  }

  try {
    const square = await blobToSquareTransparentPngBlob(cutout)
    const enhanced = await enhanceWardrobeImageForCatalogOpenAI(square)
    if (enhanced) return enhanced
  } catch {
    /* optional AI step */
  }

  try {
    return await compositeGarmentOnBabyBlue(cutout)
  } catch {
    return fileToDataUrl(file)
  }
}
