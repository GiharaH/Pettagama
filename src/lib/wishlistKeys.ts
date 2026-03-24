function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Stable id for localStorage wishlist rows tied to one improvement action. */
export function wishlistKeyForAction(
  source: 'wardrobe' | 'missing',
  type: 'add' | 'swap',
  item: string,
  search_query: string
): string {
  const n = simpleHash(`${source}|${type}|${item}|${search_query}`)
  return `wl_${n}`
}
