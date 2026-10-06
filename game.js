import fs from 'fs/promises'
import path from 'path'
import { execFileSync } from 'child_process'
import { build } from 'vite'
import { ERA } from './src/04/config.js'
import { fonts, inline } from './vendor.js'
import { gameOf } from './vite.config.js'

const SLUG = process.argv[2]
const OUT  = path.join('export', SLUG ?? '')
const ICON = 'favicon.svg'

async function page(game, vendored) {

  const file = path.join(OUT, 'index.html')
  const html = (await fs.readFile(file, 'utf-8'))
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/, vendored ? '<link rel="stylesheet" href="./fonts/fonts.css">' : '')
    .replace('<title>octantes</title>', `<title>${game.title.es}</title>\n    <meta name="description" content="${game.description.es}">\n    <link rel="icon" type="image/svg+xml" href="./assets/${ICON}">`)
    .replace('<script type="module" crossorigin src="./app.js"></script>', '<script defer src="./app.js"></script>')
    .replace('<link rel="stylesheet" crossorigin href="./style.css">', '<link rel="stylesheet" href="./style.css">')
  await fs.writeFile(file, html)

  const sheet = path.join(OUT, 'style.css')
  const css = await fs.readFile(sheet, 'utf-8')
  const used = [...new Set([...css.matchAll(/url\(['"]?\/assets\/([^'")]+)['"]?\)/g)].map(m => m[1])), ICON]
  await fs.mkdir(path.join(OUT, 'assets'), { recursive: true })
  for (const name of used) await fs.copyFile(path.join('content', 'assets', name), path.join(OUT, 'assets', name))
  await fs.writeFile(sheet, css.replace(/url\((['"]?)\/assets\//g, 'url($1assets/'))
  await inline(sheet, OUT)

}

function zip() {
  const archive = path.resolve(`${OUT}.zip`)
  try { execFileSync('zip', ['-qr', archive, '.'], { cwd: OUT }); return archive }
  catch (e) { console.warn('zip not made, compress the folder by hand:', e.message); return null }
}

async function main() {

  if (!SLUG) { console.error('usage: npm run game <slug>'); process.exit(1) }
  process.env.GAME = SLUG
  await build({ mode: 'game', logLevel: 'warn' })
  const game = gameOf(SLUG)
  const vendored = await fonts(OUT)
  await page(game, vendored)

  const date = new Date().toISOString().slice(0, 10)
  await fs.writeFile(path.join(OUT, 'README.txt'), [
    `${[...new Set([game.title.en, game.title.es])].join(' / ')}, octantes.ar, era ${ERA}, build of ${date}`,
    '',
    game.description.en,
    '',
    'open index.html in any browser. it runs from this folder, with no server and no network.',
    `${vendored} font files are inside. for itch.io, upload ${SLUG}.zip as an html game.`,
    '',
  ].join('\n'))

  await fs.rm(`${OUT}.zip`, { force: true })
  const archive = zip()
  console.log(`game: ${SLUG} -> ${OUT}/${archive ? ` and ${path.relative('.', archive)}` : ''}`)

}

main()
