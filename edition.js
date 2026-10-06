import fs from 'fs/promises'
import path from 'path'
import { SITE_URL, ERA } from './src/04/config.js'
import { pathOf } from './src/04/map.js'
import { copy, fonts, inline } from './vendor.js'

const DIST  = 'dist'
const OUT   = 'edition'
const BUNDLE = /\.(js|css)$/
const IFRAME = /<iframe[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/g
const TUBE   = /youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/
const PLAY   = 'position: absolute; inset: 0; margin: auto; width: 68px; height: 48px; display: grid; place-items: center; border-radius: 14px; background: #FF0033; background-clip: border-box; color: #FFF; -webkit-text-fill-color: #FFF; font-size: 22px; line-height: 1;'

const thumbs = new Set()

const embed = frame => (_, src) => {
  const id = src.match(TUBE)?.[1]
  if (!id || !thumbs.has(id)) return `<a href="${src}">${src}</a>`
  return `<a class="YTVideo" href="https://www.youtube.com/watch?v=${id}" title="YouTube Video" style="position: relative; display: inline-block; width: 100%; vertical-align: baseline; ${frame}; overflow: hidden; background: #000; text-decoration: none;"><img src="/posts/youtube/${id}.jpg" alt="" style="width: 100%; height: 100%; object-fit: contain; border: none; border-radius: 0; margin: 0;"><span style="${PLAY}">▶</span></a>`
}

function local(text) {
  return text
    .replace(IFRAME, embed('aspect-ratio: 16 / 9'))
    .replaceAll(`${SITE_URL}/posts/`, 'posts/').replaceAll(`${SITE_URL}/assets/`, 'assets/')
    .replace(/(["'(])\/(posts|assets)\//g, '$1$2/')
    .replace(/href="\/(?!\/)([^"]*)"/g, 'href="#/$1"')
}

function article(html) {
  const start = html.indexOf('<main class="post-content')
  return start < 0 ? null : html.slice(start, html.indexOf('</main>', start) + '</main>'.length)
}

async function videos() {

  const pages = (await walk(DIST)).filter(file => file.endsWith('.html'))
  const ids = new Set()
  for (const file of pages) for (const [, src] of (await fs.readFile(path.join(DIST, file), 'utf-8')).matchAll(IFRAME)) { const id = src.match(TUBE)?.[1]; if (id) ids.add(id) }
  await fs.mkdir(path.join(OUT, 'posts', 'youtube'), { recursive: true })
  for (const id of ids) for (const size of ['maxresdefault', 'hqdefault']) {
    const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`).catch(() => null)
    if (!response?.ok) continue
    await fs.writeFile(path.join(OUT, 'posts', 'youtube', `${id}.jpg`), Buffer.from(await response.arrayBuffer()))
    thumbs.add(id)
    break
  }
  if (thumbs.size < ids.size) console.warn(`${ids.size - thumbs.size} video thumbnails not fetched, those embeds stay plain links`)

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

async function page(vendored) {

  const file = path.join(OUT, 'index.html')
  let html = await fs.readFile(file, 'utf-8')
  html = html
    .replace(/\s*<script defer src="https:\/\/cloud\.umami\.is[^>]*><\/script>/, '')
    .replace(/\s*<link rel="preload" href="https:\/\/fonts\.googleapis[^>]*>/, '')
    .replace(/\s*<noscript>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>\s*<\/noscript>/, vendored ? '\n    <link rel="stylesheet" href="./fonts/fonts.css">' : '')
    .replace(/\s*<link rel="alternate" type="application\/rss\+xml"[^>]*>/, '')
    .replace(/href="\/assets\//g, 'href="./assets/')
    .replace('<script type="module" crossorigin src="./app.js"></script>', '<noscript><meta http-equiv="refresh" content="0; url=./archivo/archivo.html"></noscript>\n    <script defer src="./shelf.js"></script>\n    <script defer src="./app.js"></script>')
    .replace('<link rel="stylesheet" crossorigin href="./style.css">', '<link rel="stylesheet" href="./style.css">')
  await fs.writeFile(file, html)

  for (const name of ['app.js', 'style.css']) {
    const target = path.join(OUT, name)
    await fs.writeFile(target, (await fs.readFile(target, 'utf-8')).replace(/(["'(])\/(posts|assets)\//g, '$1$2/'))
  }

  await inline(path.join(OUT, 'style.css'), OUT)

}

async function walk(dir, base = dir) {
  const found = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...await walk(full, base))
    else found.push(path.relative(base, full))
  }
  return found
}

function linked(html, from) {
  const here = path.dirname(path.join('archivo', from)), to = target => path.relative(here, target) || '.'
  return html
    .replaceAll(`${SITE_URL}/`, '/')
    .replace(IFRAME, embed('height: 315px'))
    .replace(/(src|href|poster)="\/(posts|assets)\/([^"]*)"/g, (_, attr, kind, rest) => `${attr}="${to(`${kind}/${rest}`)}"`)
    .replace(/href="\/feed\.xml"/g, 'href="#"')
    .replace(/href="\?(archivo|archive)"/g, (_, name) => `href="${to(`archivo/${name}.html`)}"`)
    .replace(/href="\/([^"#?]*)(\?[^"#]*)?(#[^"]*)?"/g, (_, page, query, hash = '') => {
      const name = decodeURI(page).replace(/\/$/, '') || 'archivo'
      return `href="${to(`archivo/${name.endsWith('.html') ? name : `${name}.html`}`)}${hash}"`
    })
}

async function archive() {

  const pages = (await walk(DIST)).filter(file => file.endsWith('.html') && !/^(posts|assets)\//.test(file))
  let written = 0
  for (const file of pages) {
    const html  = await fs.readFile(path.join(DIST, file), 'utf-8')
    const start = html.indexOf('<noscript class="archive">')
    const body  = start >= 0
      ? html.slice(start + '<noscript class="archive">'.length, html.indexOf('</noscript>', start))
      : html.includes('<main class="post-content') && !html.includes('id="octantes"') ? html.slice(html.indexOf('>', html.indexOf('<body')) + 1, html.lastIndexOf('</body>')) : null
    if (!body) continue
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'octantes.ar'
    const lang  = html.match(/<html lang="(\w+)"/)?.[1] ?? 'es'
    const page  = `<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${title}</title>\n<link rel="stylesheet" href="/assets/neocities.css">\n</head>\n<body>\n${body}\n</body>\n</html>\n`
    await fs.mkdir(path.join(OUT, 'archivo', path.dirname(file)), { recursive: true })
    await fs.writeFile(path.join(OUT, 'archivo', file), linked(page, file))
    written++
  }
  return written

}

async function main() {

  await copy(path.join(DIST, 'posts'), path.join(OUT, 'posts'))
  await copy(path.join(DIST, 'assets'), path.join(OUT, 'assets'), name => !BUNDLE.test(name) || name === 'neocities.css')
  await videos()
  const shelved = await shelve()
  const vendored = await fonts(OUT)
  await page(vendored)
  const archived = await archive()
  const plain = path.join(OUT, 'assets', 'neocities.css')
  await fs.writeFile(plain, (await fs.readFile(plain, 'utf-8')).replace(/url\((['"]?)\/assets\//g, 'url($1').replace(/@import url\(['"]?https:\/\/fonts\.googleapis[^)]*\);?/, vendored ? "@import url('../fonts/fonts.css');" : ''))
  await inline(plain, path.join(OUT, 'assets'))

  const date = new Date().toISOString().slice(0, 10)
  await fs.writeFile(path.join(OUT, 'README.txt'), [
    `octantes.ar, era ${ERA}, edition of ${date}`,
    '',
    'open index.html in any browser. it runs from this folder, with no server and no network.',
    `${shelved.notes} notes, ${shelved.pages} pages of data and ${vendored} font files are inside.`,
    `without javascript, index.html sends you to archivo/archivo.html: ${archived} plain pages that work in any browser.`,
    `youtube videos show their thumbnail and open on youtube, the only thing here that needs the network.`,
    'the btc price in the status bar is frozen at the moment this edition was made.',
    '',
  ].join('\n'))

  console.log(`edition: ${shelved.notes} notes, ${shelved.pages} shelved pages, ${archived} archive pages, ${vendored} fonts -> ${OUT}/`)

}

main()