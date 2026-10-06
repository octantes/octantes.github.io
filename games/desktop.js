/* STEAM

- a game imports what it needs from here: import { unlock, desktop } from '../desktop.js'
- unlock('NAME') unlocks an achievement, NAME being its api name in steamworks > stats & achievements (publish them there first)
- call it from game logic when the moment happens; repeating it is harmless, and on the site, itch and the edition it does nothing
- desktop is true only inside the desktop build, for desktop-only things (the shell already adds the ✘, esc to quit and f11 for fullscreen)
- fullscreen() toggles fullscreen and quit() closes the game
- the app id comes from "steam: appid" in the game's note; without it the build uses 480 (spacewar, valve's public test app)
- achievements register only while steam is running; without steam the game still runs and unlock() just returns false
- the steam overlay (shift+tab) usually can't draw over webview games, achievements still count and show in the steam client
- more steam features: add a #[tauri::command] in games/desktop/src/main.rs, list it in generate_handler!, and export a wrapper here with call()

*/

const tauri = typeof window !== 'undefined' ? window.__TAURI__ ?? null : null

export const desktop = !!tauri

function call(command, args) { return tauri ? tauri.core.invoke(command, args).catch(() => null) : Promise.resolve(null) }

export function unlock(name) { return call('unlock', { name }) }
export function fullscreen()  { return call('fullscreen') }
export function quit()        { return call('quit') }