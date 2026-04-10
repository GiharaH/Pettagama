/**
 * Client-side rejection for uploads that are clearly not a single wardrobe catalog photo:
 * text tables, study sheets, dark-mode lists, grid flashcards, busy infographics with UI chrome,
 * outdoor portrait + sky, etc. Complements vision when VITE_OPENAI_API_KEY is set.
 */

function buildGray(data: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const total = w * h
  const gray = new Uint8Array(total)
  let p = 0
  for (let i = 0; i < data.length; i += 4) {
    gray[p++] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }
  return gray
}

/** Pastel pink / mauve / lavender “worksheet” backgrounds (e.g. vocabulary tables). */
function isPinkPastelWorksheetPixel(r: number, g: number, b: number, sat: number, lum: number): boolean {
  if (lum < 110 || lum > 252) return false
  if (sat < 0.04 || sat > 0.55) return false
  if (r < 170) return false
  if (g < 120 || g > 245) return false
  if (b < 150 || b > 255) return false
  if (r < g - 30) return false
  return true
}

/** Strong right-edge brightness strip (social / video UI) vs darker content column. */
function hasBrightRightChromeStrip(data: Uint8ClampedArray, w: number, h: number): boolean {
  const xContent = Math.floor(w * 0.62)
  const xStrip = Math.floor(w * 0.86)
  let leftL = 0
  let leftN = 0
  let rightL = 0
  let rightN = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (x < xContent) {
        leftL += lum
        leftN++
      }
      if (x >= xStrip) {
        rightL += lum
        rightN++
      }
    }
  }
  if (leftN < 1 || rightN < 1) return false
  const leftM = leftL / leftN
  const rightM = rightL / rightN
  return rightM > leftM + 38 && rightM > 185
}

/** Top band looks like open sky; bottom is busier — typical outdoor portrait. */
function looksLikeOutdoorPortraitWithSky(data: Uint8ClampedArray, gray: Uint8Array, w: number, h: number): boolean {
  const band = Math.max(2, Math.floor(h * 0.2))
  let tr = 0
  let tg = 0
  let tb = 0
  let tn = 0
  for (let y = 0; y < band; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      tr += data[i]
      tg += data[i + 1]
      tb += data[i + 2]
      tn++
    }
  }
  if (tn < 1) return false
  tr /= tn
  tg /= tn
  tb /= tn
  const skyLike = tb > tr + 10 && tb > tg + 6 && tb > 85

  let edgesTop = 0
  let cellsTop = 0
  for (let y = 1; y < Math.min(band, h - 2); y++) {
    for (let x = 1; x < w - 1; x++) {
      cellsTop++
      const idx = y * w + x
      const g = gray[idx]
      const e =
        Math.abs(g - gray[idx + 1]) +
        Math.abs(g - gray[idx - 1]) +
        Math.abs(g - gray[idx + w]) +
        Math.abs(g - gray[idx - w])
      if (e > 56) edgesTop++
    }
  }

  const yStart = Math.floor(h * 0.42)
  let edgesBot = 0
  let cellsBot = 0
  for (let y = yStart; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      cellsBot++
      const idx = y * w + x
      const g = gray[idx]
      const e =
        Math.abs(g - gray[idx + 1]) +
        Math.abs(g - gray[idx - 1]) +
        Math.abs(g - gray[idx + w]) +
        Math.abs(g - gray[idx - w])
      if (e > 56) edgesBot++
    }
  }

  const smoothTop = cellsTop > 0 && edgesTop / cellsTop < 0.048
  const busyBottom = cellsBot > 0 && edgesBot / cellsBot > 0.068
  return skyLike && smoothTop && busyBottom
}

function analyzeBitmap(data: Uint8ClampedArray, w: number, h: number): boolean {
  const total = w * h
  let nearWhite = 0
  let nearBlack = 0
  let lowSatBright = 0
  let satAccum = 0
  let colorCount = 0
  let pinkPastel = 0
  let lightInk = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    const maxc = Math.max(r, g, b)
    const minc = Math.min(r, g, b)
    const sat = maxc === 0 ? 0 : (maxc - minc) / maxc

    if (lum >= 246) nearWhite++
    if (lum <= 40) nearBlack++
    if (sat < 0.09 && lum > 172) lowSatBright++
    if (lum >= 198 && lum <= 255 && sat < 0.12) lightInk++

    if (sat > 0.12) {
      satAccum += sat
      colorCount++
    }
    if (isPinkPastelWorksheetPixel(r, g, b, sat, lum)) pinkPastel++
  }

  const whiteRatio = nearWhite / total
  const blackRatio = nearBlack / total
  const avgSatAmongColor = colorCount > 0 ? satAccum / colorCount : 0
  const lowSatBrightRatio = lowSatBright / total
  const pinkRatio = pinkPastel / total
  const lightInkRatio = lightInk / total

  const gray = buildGray(data, w, h)

  let edges = 0
  const innerW = w - 2
  const innerH = h - 2
  if (innerW < 1 || innerH < 1) return false

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x
      const g0 = gray[idx]
      const gx = Math.abs(g0 - gray[idx + 1]) + Math.abs(g0 - gray[idx - 1])
      const gy = Math.abs(g0 - gray[idx + w]) + Math.abs(g0 - gray[idx - w])
      if (gx + gy > 72) edges++
    }
  }

  const inner = innerW * innerH
  const edgeRatio = edges / inner

  // Grid / table: many strong horizontal and vertical stroke lines
  let strongHRows = 0
  for (let y = 1; y < h - 1; y++) {
    let sum = 0
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x
      sum += Math.abs(gray[idx] - gray[idx + 1])
    }
    if (sum / (w - 2) > 16) strongHRows++
  }
  let strongVCols = 0
  for (let x = 1; x < w - 1; x++) {
    let sum = 0
    for (let y = 1; y < h - 1; y++) {
      const idx = y * w + x
      sum += Math.abs(gray[idx] - gray[idx + w])
    }
    if (sum / (h - 2) > 16) strongVCols++
  }
  const gridLike = strongHRows / h > 0.09 && strongVCols / w > 0.055

  // Pink / lavender study sheet + text + lines
  if (pinkRatio > 0.32 && blackRatio >= 0.008 && blackRatio <= 0.35 && edgeRatio > 0.08) {
    return true
  }

  if (gridLike && (pinkRatio > 0.18 || whiteRatio > 0.25 || lowSatBrightRatio > 0.35) && blackRatio >= 0.006 && blackRatio <= 0.34) {
    return true
  }

  // Black (or dark) text on white / off-white UI
  if (whiteRatio > 0.34 && blackRatio >= 0.01 && blackRatio <= 0.32 && avgSatAmongColor < 0.42) {
    return true
  }

  // Dark background + light text (lists, “dark mode” study cards)
  if (blackRatio > 0.28 && lightInkRatio > 0.04 && lightInkRatio < 0.42 && avgSatAmongColor < 0.52) {
    return true
  }

  // Previous: dark bg + white pixels
  if (blackRatio > 0.32 && whiteRatio >= 0.012 && whiteRatio <= 0.38 && avgSatAmongColor < 0.48) {
    return true
  }

  if (lowSatBrightRatio > 0.52 && blackRatio >= 0.008 && blackRatio <= 0.35 && avgSatAmongColor < 0.28) {
    return true
  }

  if (avgSatAmongColor < 0.22 && colorCount > total * 0.05 && blackRatio >= 0.015 && blackRatio <= 0.3 && whiteRatio > 0.2) {
    return true
  }

  if (edgeRatio > 0.2 && whiteRatio > 0.22 && avgSatAmongColor < 0.36) {
    return true
  }

  // Infographic / social screenshot: UI strip + busy edges
  if (hasBrightRightChromeStrip(data, w, h) && edgeRatio > 0.14) {
    return true
  }

  // Outdoor scenic portrait (sky + subject)
  if (looksLikeOutdoorPortraitWithSky(data, gray, w, h)) {
    return true
  }

  return false
}

/** True when the image should be rejected before wardrobe processing (no API required). */
export function isImageLikelyTextOrNonWardrobeScreenshot(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const maxSide = 256
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(false)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const { data } = ctx.getImageData(0, 0, w, h)
        resolve(analyzeBitmap(data, w, h))
      } catch {
        resolve(false)
      }
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}
