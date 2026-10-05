import fs from 'fs/promises'
import path from 'path'
import { SITE_URL, ERA } from './src/04/config.js'
import { pathOf } from './src/04/map.js'

const DIST  = 'dist'
const OUT   = 'edition'
const FONTS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Inconsolata:wght@400;700&family=Space+Grotesk:wght@400;700&family=Jomolhari&display=swap'
const AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const BUNDLE = /\.(js|css)$/

function local(text) {
  return text
    .replaceAll(`${SITE_URL}/posts/`, 'posts/').replaceAll(`${SITE_URL}/assets/`, 'assets/')
    .replace(/(["'(])\/(posts|assets)\//g, '$1$2/')
    .replace(/href="\/(?!\/)([^"]*)"/g, 'href="#/$1"')
    .replace(/<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>/g, '<a href="$1">$1</a>')
}

function article(html) {
  const start = html.indexOf('<main class="post-content')
  return start < 0 ? null : html.slice(start, html.indexOf('</main>', start) + '</main>'.length)
}

async function copy(from, to, keep = () => true) {
  await fs.mkdir(to, { recursive: true })
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const [source, target] = [path.join(from, entry.name), path.join(to, entry.name)]
    if (entry.isDirectory()) await copy(source, target, keep)
    else if (keep(entry.name)) await fs.copyFile(source, target)
  }
}

async function shelve() {

  const shelf = {}
  const notes = JSON.parse(await fs.readFile(path.join(DIST, 'index.json'), 'utf-8'))
  shelf['index.json'] = local(JSON.stringify(notes))

  for (const note of notes) for (const lang of note.bilingual ? ['es', 'en'] : ['es']) {
    const page = pathOf({ kind: 'note', id: note.type, slug: note.slug }, lang)
    const html = article(await fs.readFile(path.join(DIST, `${page}.html`), 'utf-8'))
    if (html) shelf[`${page.slice(1)}.html`] = local(html)
  }

  shelf['vitacora.json'] = local(await fs.readFile(path.join(DIST, 'vitacora.json'), 'utf-8'))
  const boards = await fs.readdir(path.join(DIST, 'posts', 'vitacora')).catch(() => [])
  for (const board of boards.filter(name => name.endsWith('.svg'))) shelf[`posts/vitacora/${board}`] = await fs.readFile(path.join(DIST, 'posts', 'vitacora', board), 'utf-8')

  shelf.btc = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then(r => r.json()).then(d => `${Math.round(d.bitcoin.usd / 100) / 10}K`).catch(() => null)

  await fs.writeFile(path.join(OUT, 'shelf.js'), `window.__shelf = ${JSON.stringify(shelf)}\n`)
  return { notes: notes.length, pages: Object.keys(shelf).length }

}

async function fonts() {

  try {
    const css = await (await fetch(FONTS, { headers: { 'User-Agent': AGENT } })).text()
    const files = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))]
    await fs.mkdir(path.join(OUT, 'fonts'), { recursive: true })
    let sheet = css
    for (const [i, url] of files.entries()) {
      const name = `font-${i}${path.extname(url)}`
      await fs.writeFile(path.join(OUT, 'fonts', name), Buffer.from(await (await fetch(url)).arrayBuffer()))
      sheet = sheet.replaceAll(url, name)
    }
    await fs.writeFile(path.join(OUT, 'fonts', 'fonts.css'), sheet)
    return files.length
  } catch (e) { console.warn('fonts not vendored, the edition will fall back to system fonts:', e.message); return 0 }

}

async function page(vendored) {

  const file = path.join(OUT, 'index.html')
  let html = await fs.readFile(file, 'utf-8')
  html = html
    .replace(/\s*<script defer src="https:\/\/cloud\.umami\.is[^>]*><\/script>/, '')
    .replace(/\s*<link rel="preload" href="https:\/\/fonts\.googleapis[^>]*>/, '')
    .replace(/\s*<noscript>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>\s*<\/noscript>/, vendored ? '\n    <link rel="stylesheet" href="./fonts/fonts.css">' : '')
    .replace(/\s*<link rel="alternate" type="application\/rss\+xml"[^>]*>/, '')
    .replace(/href="\/assets\//g, 'href="./assets/')
    .replace('<script type="module" crossorigin src="./app.js"></script>', '<script defer src="./shelf.js"></script>\n    <script defer src="./app.js"></script>')
    .replace('<link rel="stylesheet" crossorigin href="./style.css">', '<link rel="stylesheet" href="./style.css">')
  await fs.writeFile(file, html)

  for (const name of ['app.js', 'style.css']) {
    const target = path.join(OUT, name)
    await fs.writeFile(target, (await fs.readFile(target, 'utf-8')).replace(/(["'(])\/(posts|assets)\//g, '$1$2/'))
  }

  const sheet = path.join(OUT, 'style.css')
  let css = await fs.readFile(sheet, 'utf-8')
  for (const [match, file] of css.matchAll(/url\(['"]?(assets\/[^'")]+\.svg)['"]?\)/g)) css = css.replaceAll(match, `url("data:image/svg+xml;base64,${(await fs.readFile(path.join(OUT, file))).toString('base64')}")`)
  await fs.writeFile(sheet, css)

}

async function main() {

  await copy(path.join(DIST, 'posts'), path.join(OUT, 'posts'))
  await copy(path.join(DIST, 'assets'), path.join(OUT, 'assets'), name => !BUNDLE.test(name))
  const shelved = await shelve()
  const vendored = await fonts()
  await page(vendored)

  const date = new Date().toISOString().slice(0, 10)
  await fs.writeFile(path.join(OUT, 'README.txt'), [
    `octantes.ar, era ${ERA}, edition of ${date}`,
    '',
    'open index.html in any browser. it runs from this folder, with no server and no network.',
    `${shelved.notes} notes, ${shelved.pages} pages of data and ${vendored} font files are inside.`,
    'the btc price in the status bar is frozen at the moment this edition was made.',
    '',
  ].join('\n'))

  console.log(`edition: ${shelved.notes} notes, ${shelved.pages} shelved pages, ${vendored} fonts -> ${OUT}/`)

}

main()
