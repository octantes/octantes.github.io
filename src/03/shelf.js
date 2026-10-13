const shelf = typeof window !== 'undefined' ? window.__shelf ?? null : null

export const offline = !!shelf

export function shelved(key) { return shelf?.[key] ?? null }

export async function read(path) {
  if (!shelf) return fetched(path)
  const key = decodeURI(path).replace(/^\.?\//, '')
  if (!(key in shelf)) throw new Error(`not in this edition: ${key}`)
  return shelf[key]
}

async function fetched(path, tries = 2) {
  try {
    const response = await fetch(path, { signal: AbortSignal.timeout?.(8000) })
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)
    return await response.text()
  } catch (e) {
    if (tries > 1 && (e.name === 'TimeoutError' || e instanceof TypeError)) return fetched(path, tries - 1)
    throw e
  }
}