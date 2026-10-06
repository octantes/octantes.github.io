import fs from 'fs/promises'
import path from 'path'

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
