import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sizeOf from 'image-size'
import sharp from 'sharp'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist-content'  // directorio final de posts
const cacheFile = path.resolve('.build-cache.json')
const siteUrl = 'https://octantes.github.io'

let cache = {}
try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) } catch {}

const postDirs = (await fs.readdir(contentDir, { withFileTypes: true }))
  .filter(d => d.isDirectory())
  .map(d => d.name)

const postsDir = path.join(outputDir, 'posts')

let fullRebuild = false
try { await fs.access(postsDir) } catch { fullRebuild = true }

const regeneratedFiles = []
const removedFiles = []

// eliminar orphans
try {
  const existingDirs = await fs.readdir(postsDir, { withFileTypes: true })
  for (const dirent of existingDirs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!postDirs.includes(slug)) {
      const rmDir = path.join(postsDir, slug)
      await fs.rm(rmDir, { recursive: true, force: true })
      removedFiles.push(rmDir)
      delete cache[`${slug}/index.md`]
    }
  }
} catch { await fs.mkdir(postsDir, { recursive: true }) }

const indexItems = []

function processImgTag(attrs, noteOutputDir, portada) {
  const srcMatch = attrs.match(/src=['"]([^'"]+)['"]/)
  const altMatch = attrs.match(/alt=['"]([^'"]*)['"]/)
  if (!srcMatch) return `<img ${attrs}>`
  const src = path.join(noteOutputDir, srcMatch[1])
  let dimensions = { width: 600, height: 400 }
  if (srcMatch[1] === portada) dimensions = { width: 1200, height: 630 }
  else { try { dimensions = sizeOf(src) } catch {} }
  const altText = altMatch ? altMatch[1] : ''
  let newAttrs = attrs
    .replace(/width=['"][^'"]*['"]/, '')
    .replace(/height=['"][^'"]*['"]/, '')
    .replace(/alt=['"][^'"]*['"]/, '')
  newAttrs += ` width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}"`
  return `<img ${newAttrs}>`
}

const template = await fs.readFile('./templates/post.html', 'utf-8')

for (const slug of postDirs) {
  const postFolder = path.join(contentDir, slug)
  const mdPath = path.join(postFolder, 'index.md')
  let raw
  try { raw = await fs.readFile(mdPath, 'utf-8') }
  catch { console.warn(`no se encontró index.md en ${slug}, se saltea`); continue }

  const { attributes, body } = fm(raw)
  const noteOutputDir = path.join(postsDir, slug)
  await fs.mkdir(noteOutputDir, { recursive: true })

  const hash = crypto.createHash('sha256').update(raw)
  try {
    const assets = await fs.readdir(postFolder, { withFileTypes: true })
    for (const asset of assets) {
      if (!asset.isFile() || asset.name === 'index.md') continue
      const assetPath = path.join(postFolder, asset.name)
      const destPath = path.join(noteOutputDir, asset.name)
      const data = await fs.readFile(assetPath)
      hash.update(data)
      if (/\.(jpe?g|png)$/i.test(asset.name)) {
        const outPath = destPath.replace(/\.(jpe?g|png)$/i, '.webp')
        await sharp(assetPath).resize({ width: 1200 }).webp({ quality: 80 }).toFile(outPath)
        regeneratedFiles.push(outPath)
      } else {
        await fs.writeFile(destPath, data)
        regeneratedFiles.push(destPath)
      }
    }
  } catch {}

  const finalHash = hash.digest('hex')

  if (fullRebuild || cache[`${slug}/index.md`] !== finalHash) {
    let htmlContent = md.render(body)
    const relativeDepth = path.relative(outputDir, noteOutputDir).split(path.sep).length
    const basePath = '../'.repeat(relativeDepth)
    htmlContent = htmlContent.replace(/(src|href)=['"]\.\/([^'"]+)['"]/g, `$1=$2${basePath}$2`)
    htmlContent = htmlContent.replace(/<img\s+([^>]+?)>/g, (match, attrs) => processImgTag(attrs, noteOutputDir, attributes.portada))

    const title = attributes.title || slug
    const description = attributes.description || ''
    const portada = attributes.portada ? `${siteUrl}/posts/${slug}/${attributes.portada}` : ''
    const canonicalUrl = `${siteUrl}/posts/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''
    const date = attributes.date || new Date().toISOString()
    const authorJson = handle
      ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}`
      : `{"@type":"Person","name":"Desconocido"}`

    let fullHtml = template
      .replace(/{{title}}/g, title)
      .replace(/{{description}}/g, description)
      .replace(/{{portada}}/g, portada)
      .replace(/{{canonicalUrl}}/g, canonicalUrl)
      .replace(/{{handle}}/g, handle)
      .replace(/{{date}}/g, date)
      .replace(/{{authorJson}}/g, authorJson)
      .replace(/{{htmlContent}}/g, htmlContent)

    const outPath = path.join(noteOutputDir, 'index.html')
    await fs.writeFile(outPath, fullHtml)
    regeneratedFiles.push(outPath)
    cache[`${slug}/index.md`] = finalHash
  } else console.log(`skip ${slug}/index.md (unchanged)`)

  indexItems.push({
    slug,
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/`
  })
}

// escribir arrays de commit solo de posts
const buildChanges = {
  add: regeneratedFiles,
  remove: removedFiles
}
await fs.writeFile('.build-changes.json', JSON.stringify(buildChanges, null, 2))

// index.json, sitemap.xml, robots.txt, cache, 404.html
await fs.mkdir(outputDir, { recursive: true })

// index.json
const indexPath = path.join(outputDir, 'index.json')
let prevIndex = '[]'
try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch {}
indexItems.sort((a,b)=> (a.date?new Date(a.date):new Date(0)) - (b.date?new Date(b.date):new Date(0))).reverse()
const newIndexStr = JSON.stringify(indexItems,null,2)
if (prevIndex !== newIndexStr) await fs.writeFile(indexPath,newIndexStr)

// sitemap.xml
const staticPages = [
  { url: '/', lastmod: new Date().toISOString() },
  { url: '/about/', lastmod: new Date().toISOString() },
  { url: '/contact/', lastmod: new Date().toISOString() }
]
const postPages = indexItems.map(post=>({url:post.url,lastmod:post.date||new Date().toISOString()}))
const allPages = [...staticPages,...postPages]
const sitemapItems = allPages.map(p=>`
  <url>
    <loc>${siteUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
  </url>
`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</urlset>`
await fs.writeFile(path.join(outputDir,'sitemap.xml'), sitemap)

// robots.txt
const robots = `User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`
await fs.writeFile(path.join(outputDir,'robots.txt'), robots)

// cache
await fs.mkdir(path.dirname(cacheFile), { recursive: true })
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

// 404.html
try {
  const indexHtml = await fs.readFile(path.join(outputDir, 'index.html'), 'utf-8')
  await fs.writeFile(path.join(outputDir, '404.html'), indexHtml)
} catch (e) { console.error('no se pudo generar 404.html', e) }

console.log('build completado: posts generados y dist-content preparado para sync a docs.')