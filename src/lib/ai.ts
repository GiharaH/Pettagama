import type { WardrobeCategory } from '@/types'
import { ALL_CATEGORIES } from '@/lib/constants'
import { isImageLikelyTextOrNonWardrobeScreenshot } from '@/lib/wardrobeImageHeuristic'

const CATEGORY_LIST = ALL_CATEGORIES.join(', ')

/** Read a user-selected file as a data URL (for validation before heavy processing). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * When VITE_OPENAI_API_KEY is set, asks the vision model if the image is wardrobe-appropriate.
 * Returns false for unrelated content (food, pets, landscapes, documents, etc.).
 * Returns null if no key or on error — callers should treat null as “allow” (no gate).
 */
export async function isImageWardrobeAppropriate(dataUrl: string): Promise<boolean | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || typeof apiKey !== 'string') return null

  try {
    const body = {
      model: 'gpt-4o-mini',
      max_tokens: 12,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You gate uploads for a wardrobe app. Reply with exactly YES or NO.

Reply NO if the image is ANY of these:
• Text-heavy graphics: vocabulary tables, flashcards, study sheets, language-learning grids, pink or pastel worksheet layouts, numbered lists of words, screenshots that are mostly typography.
• Educational or meme graphics on black or colored backgrounds that are not a photo of clothing.
• Multi-panel infographics, collages with arrows between photos, “how to style” charts, Pinterest/TikTok/Instagram-style layouts with several small photos plus UI (hearts, comment counts, @handles).
• Outdoor or indoor lifestyle portraits where the person and scenery are the focus—not a clear catalog-style shot of one item to add to a closet.
• Cartoons, anime, illustrations, game/TV character art, or any non-photograph drawing—even if the character wears clothes.
• Anything that is not a real photograph of one wearable fashion item (or one clear flat-lay / product-style shot of an item).

Reply YES only for a real photo where one clothing piece, shoes, bag, or small accessory is the clear subject (flat lay on a plain surface or a simple product-style shot is OK).`,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) return null
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase()
    if (!raw) return null
    if (raw.startsWith('no') || /\bno\b/.test(raw)) return false
    if (raw.startsWith('yes') || /\byes\b/.test(raw)) return true
    return null
  } catch {
    return null
  }
}

/**
 * Block uploads that are clearly not wardrobe items: runs local text/screenshot heuristics
 * first (no API key required), then vision YES/NO when a key is set.
 */
export async function shouldBlockWardrobeImageUpload(dataUrl: string): Promise<boolean> {
  if (await isImageLikelyTextOrNonWardrobeScreenshot(dataUrl)) return true
  const vision = await isImageWardrobeAppropriate(dataUrl)
  return vision === false
}

/** Convert a blob URL to base64 data URL for API uploads */
async function blobUrlToBase64DataUrl(blobUrl: string): Promise<string> {
  const res = await fetch(blobUrl)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Use AI (OpenAI Vision) to suggest a clothing category from an image.
 * Set VITE_OPENAI_API_KEY in .env to enable. Returns null if no key or on error.
 */
export async function suggestCategoryForImage(blobUrl: string): Promise<WardrobeCategory | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || typeof apiKey !== 'string') return null

  try {
    const dataUrl = await blobUrlToBase64DataUrl(blobUrl)
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')

    const body = {
      model: 'gpt-4o-mini',
      max_tokens: 20,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `What type of clothing or accessory is in this image? Reply with exactly one of these keywords, nothing else: ${CATEGORY_LIST}. If unclear, pick the closest match.`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) return null
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) return null
    const content = raw.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
    const match = ALL_CATEGORIES.find((c) => c.toLowerCase() === content)
    return match ?? null
  } catch {
    return null
  }
}

const CATALOG_EDIT_PROMPT =
  'Professional e-commerce catalog photo of this clothing item: soft even studio lighting, color-balanced, natural fabric texture, crisp silhouette, centered composition. Place the garment on a flat solid pastel baby blue background matching hex #b8e0f2 (no gradients). No people, no mannequin, no hangers, no props, no text. Minimalist product photography.'

/**
 * Optional DALL·E 2 image edit for a square transparent PNG cutout. Returns a data URL or null.
 * Requires VITE_OPENAI_API_KEY. On failure or no key, callers should composite locally instead.
 */
export async function enhanceWardrobeImageForCatalogOpenAI(squarePngBlob: Blob): Promise<string | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || typeof apiKey !== 'string') return null

  try {
    const form = new FormData()
    form.append('image', new File([squarePngBlob], 'garment.png', { type: 'image/png' }))
    form.append('prompt', CATALOG_EDIT_PROMPT)
    form.append('model', 'dall-e-2')
    form.append('n', '1')
    form.append('size', '1024x1024')
    form.append('response_format', 'b64_json')

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { data?: Array<{ b64_json?: string }> }
    const b64 = data.data?.[0]?.b64_json
    if (!b64) return null
    return `data:image/png;base64,${b64}`
  } catch {
    return null
  }
}
