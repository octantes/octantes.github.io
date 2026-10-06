const shelf = typeof window !== 'undefined' ? window.__shelf ?? null : null

export const offline = !!shelf

export function shelved(key) { return shelf?.[key] ?? null }

export async function read(path) {
  if (!shelf) {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)
    return response.text()
  }
  const key = decodeURI(path).replace(/^\.?\//, '')
  if (!(key in shelf)) throw new Error(`not in this edition: ${key}`)
  return shelf[key]
}