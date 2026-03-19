import type { WardrobeCategory } from '@/types'
import { ALL_CATEGORIES } from '@/lib/constants'

const CATEGORY_LIST = ALL_CATEGORIES.join(', ')

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
