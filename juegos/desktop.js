const tauri = typeof window !== 'undefined' ? window.__TAURI__ ?? null : null

export const desktop = !!tauri

function call(command, args) { return tauri ? tauri.core.invoke(command, args).catch(() => null) : Promise.resolve(null) }

export function unlock(name) { return call('unlock', { name }) }
export function fullscreen()  { return call('fullscreen') }
export function quit()        { return call('quit') }