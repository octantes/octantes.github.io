import fs from 'fs/promises'
import path from 'path'

// EXPORTS  | command                         | output             | what it is
// SITE     | npm run build                   | dist/              | the live site, deployed only by the build-md action on every push
// DEV      | npm run dev                     | dist/ + server     | the site as the workshop: rebuilds on save and shows hidden notes ("mostrar: no") faded
// ARCHIVE  | (part of every build)           | dist/**.html       | the flat no-js archive inside each page, indexed by archivo.html and archive.html
// EDITION  | npm run edition                 | edition/           | the whole site as a folder that runs from disk with no server or network, plus edition/archivo/
// GAME     | npm run game <slug>             | export/<slug>/     | one game alone, runnable from disk, plus export/<slug>.zip to upload to itch.io as an html game
// STEAM    | actions > game-desktop > run    | artifacts/release  | windows (<slug>.exe + steam_api64.dll) and linux (unpacked appimage, launch AppRun) builds

/* NOTES

- this file holds what edition.js and game.js share: copying folders, vendoring the google fonts, inlining svgs used by css
- edition and game builds are classic scripts with relative paths and no fetch (src/03/shelf.js holds the data), so they open by double click
- a game's code lives in games/<slug>/game.vue and its title, ground and steam app id come from its note in content/juegos/<slug>
- game builds swap src/04/store.js for games/store.js, so the site's router and pages never enter a game
- game-desktop action: pick the game, linux and/or windows, and tick publish to also make a github release; add new games to its dropdown
- the steam builds compile only on github, nothing of tauri or rust is installed locally or listed in package.json
- in steamworks the linux launch must use "steam linux runtime 4.0" or no container, the older "sniper" runtime is too old for webkitgtk
- achievements and other steam calls from a game: see games/desktop.js
- an era's warc capture, recordings and edition wrapper wait until that era ends

*/

export const FONTS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Inconsolata:wght@400;700&family=Space+Grotesk:wght@400;700&family=Jomolhari&display=swap'
const AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

export async function copy(from, to, keep = () => true) {
  await fs.mkdir(to, { recursive: true })
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const [source, target] = [path.join(from, entry.name), path.join(to, entry.name)]
    if (entry.isDirectory()) await copy(source, target, keep)
    else if (keep(entry.name)) await fs.copyFile(source, target)
  }
}

export async function fonts(out) {

  try {
    const css = await (await fetch(FONTS, { headers: { 'User-Agent': AGENT } })).text()
    const files = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))]
    await fs.mkdir(path.join(out, 'fonts'), { recursive: true })
    let sheet = css
    for (const [i, url] of files.entries()) {
      const name = `font-${i}${path.extname(url)}`
      await fs.writeFile(path.join(out, 'fonts', name), Buffer.from(await (await fetch(url)).arrayBuffer()))
      sheet = sheet.replaceAll(url, name)
    }
    await fs.writeFile(path.join(out, 'fonts', 'fonts.css'), sheet)
    return files.length
  } catch (e) { console.warn('fonts not vendored, it will fall back to system fonts:', e.message); return 0 }

}

export async function inline(sheet, root) {
  let css = await fs.readFile(sheet, 'utf-8')
  for (const [match, file] of css.matchAll(/url\(['"]?([^'")]+\.svg)['"]?\)/g)) css = css.replaceAll(match, `url("data:image/svg+xml;base64,${(await fs.readFile(path.join(root, file))).toString('base64')}")`)
  await fs.writeFile(sheet, css)
}