import { enhanceWardrobeImageForCatalogOpenAI } from '@/lib/ai'

/** Same baby blue as Wardrobe “Add item” pill buttons */
export const WARDROBE_CATALOG_BG = '#b8e0f2'

type DominantColourResult = { catalogUrl: string; dominantColour: string }

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

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function distanceSq(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

/**
 * K-means on sampled pixels (RGB) to find the dominant cluster.
 * Designed to run fast enough for client-side uploads.
 */
function kMeansDominantColour(points: Array<{ r: number; g: number; b: number }>, k: number = 3) {
  if (points.length === 0) return { r: 200, g: 200, b: 200, count: 0 }

  const uniq = new Set(points.map((p) => `${p.r},${p.g},${p.b}`))
  if (uniq.size < k) {
    const avg = points.reduce(
      (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
      { r: 0, g: 0, b: 0 },
    )
    return { ...({ r: avg.r / points.length, g: avg.g / points.length, b: avg.b / points.length } as const), count: points.length }
  }

  // Deterministic-ish seeding: choose first k points after shuffling by index step.
  const stride = Math.max(1, Math.floor(points.length / (k * 5)))
  const centers = Array.from({ length: k }, (_, i) => points[i * stride % points.length])
    .map((p) => ({ r: p.r, g: p.g, b: p.b }))

  let assignments = new Array(points.length).fill(0)
  for (let iter = 0; iter < 10; iter++) {
    let changed = false

    // Assign
    for (let i = 0; i < points.length; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c++) {
        const d = distanceSq(points[i], centers[c])
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best
        changed = true
      }
    }

    if (!changed) break

    // Update
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (let i = 0; i < points.length; i++) {
      const a = assignments[i]
      sums[a].r += points[i].r
      sums[a].g += points[i].g
      sums[a].b += points[i].b
      sums[a].n += 1
    }

    for (let c = 0; c < k; c++) {
      if (sums[c].n === 0) continue
      centers[c] = { r: sums[c].r / sums[c].n, g: sums[c].g / sums[c].n, b: sums[c].b / sums[c].n }
    }
  }

  // Pick the largest cluster
  const counts = new Array(k).fill(0)
  for (const a of assignments) counts[a] += 1
  let best = 0
  for (let c = 1; c < k; c++) if (counts[c] > counts[best]) best = c

  return { ...centers[best], count: counts[best] }
}

async function imageBitmapFromBlob(blob: Blob) {
  return await createImageBitmap(blob)
}

async function extractDominantColourFromTransparentCutoutBlob(cutoutBlob: Blob): Promise<string> {
  const bmp = await imageBitmapFromBlob(cutoutBlob)
  const maxSide = 300
  const scale = Math.min(maxSide / bmp.width, maxSide / bmp.height, 1)
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#808080'

  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(bmp, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h)

  // Sample points, ignoring fully transparent pixels.
  const points: Array<{ r: number; g: number; b: number }> = []
  const data = img.data
  const stride = Math.max(1, Math.floor(Math.sqrt((w * h) / 6000))) // ~6k samples max

  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      const idx = (y * w + x) * 4
      const a = data[idx + 3]
      if (a < 40) continue
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      points.push({ r, g, b })
    }
  }

  const dom = kMeansDominantColour(points, 3)
  return rgbToHex(dom.r, dom.g, dom.b)
}

async function extractDominantColourFromOpaqueDataUrl(dataUrl: string): Promise<string> {
  // Fallback extraction: use k-means, but bias away from border/background by excluding pixels
  // close to the averaged border colour.
  const img = new Image()
  img.decoding = 'async'

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })

  const maxSide = 300
  const scale = Math.min(maxSide / img.width, maxSide / img.height, 1)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#808080'
  ctx.drawImage(img, 0, 0, w, h)
  const im = ctx.getImageData(0, 0, w, h)
  const d = im.data

  // Estimate border/background colour.
  const borderSamples: Array<{ r: number; g: number; b: number }> = []
  const take = Math.max(1, Math.floor(Math.min(w, h) / 30))
  for (let x = 0; x < w; x += take) {
    for (const y of [0, h - 1]) {
      const idx = (y * w + x) * 4
      borderSamples.push({ r: d[idx], g: d[idx + 1], b: d[idx + 2] })
    }
  }
  for (let y = 0; y < h; y += take) {
    for (const x of [0, w - 1]) {
      const idx = (y * w + x) * 4
      borderSamples.push({ r: d[idx], g: d[idx + 1], b: d[idx + 2] })
    }
  }
  const borderAvg = borderSamples.reduce((acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }), { r: 0, g: 0, b: 0 })
  borderAvg.r /= borderSamples.length
  borderAvg.g /= borderSamples.length
  borderAvg.b /= borderSamples.length

  const points: Array<{ r: number; g: number; b: number }> = []
  const stride = Math.max(1, Math.floor(Math.sqrt((w * h) / 6000)))

  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      const idx = (y * w + x) * 4
      const p = { r: d[idx], g: d[idx + 1], b: d[idx + 2] }
      // Exclude near-border pixels (likely background).
      if (distanceSq(p, borderAvg) < 35 * 35) continue
      points.push(p)
    }
  }

  const dom = kMeansDominantColour(points, 3)
  return rgbToHex(dom.r, dom.g, dom.b)
}

/**
 * Remove background in-browser, optionally refine with OpenAI image edits, else composite on baby blue.
 */
export async function processWardrobeUpload(file: File): Promise<DominantColourResult> {
  const removeBackground = await loadRemoveBackground()
  try {
    const cutout = await removeBackground(file)
    const dominantColour = await extractDominantColourFromTransparentCutoutBlob(cutout)

    try {
      const square = await blobToSquareTransparentPngBlob(cutout)
      const enhanced = await enhanceWardrobeImageForCatalogOpenAI(square)
      if (enhanced) return { catalogUrl: enhanced, dominantColour }
    } catch {
      /* optional AI step */
    }

    try {
      const catalogUrl = await compositeGarmentOnBabyBlue(cutout)
      return { catalogUrl, dominantColour }
    } catch {
      // If compositing fails, fall back to original upload.
      const fallbackUrl = await fileToDataUrl(file)
      return { catalogUrl: fallbackUrl, dominantColour }
    }
  } catch {
    const catalogUrl = await fileToDataUrl(file)
    const dominantColour = await extractDominantColourFromOpaqueDataUrl(catalogUrl)
    return { catalogUrl, dominantColour }
  }
}
