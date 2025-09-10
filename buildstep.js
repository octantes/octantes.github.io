import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sizeOf from 'image-size'
import sharp from 'sharp'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist'
const cacheFile = path.resolve('.build-cache.json')
const siteUrl = 'https://octantes.github.io'

let cache = {}
try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) } catch {}

let postDirs = []
try {
  postDirs = (await fs.readdir(contentDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
} catch { postDirs = [] }

const postsDir = path.join(outputDir, 'posts')
let fullRebuild = false
try { await fs.access(postsDir) } catch { fullRebuild = true; await fs.mkdir(postsDir, { recursive: true }) }

try {
  const existingDirs = await fs.readdir(postsDir, { withFileTypes: true })
  for (const dirent of existingDirs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!postDirs.includes(slug)) {
      await fs.rm(path.join(postsDir, slug), { recursive: true, force: true })
    }
  }
} catch { await fs.mkdir(postsDir, { recursive: true }) }

for (const key of Object.keys(cache)) {
  const slug = key.split('/')[0]
  if (!postDirs.includes(slug)) delete cache[key]
}

const indexItems = []

function processImgTag(attrs, slug, portada) {
  const srcMatch = attrs.match(/src=['"]([^'"]+)['"]/)
  const altMatch = attrs.match(/alt=['"]([^'"]*)['"]/)
  if (!srcMatch) return `<img ${attrs}>`

  let filename = srcMatch[1]
  let dimensions = { width: 600, height: 400 }
  if (filename === portada) dimensions = { width: 1200, height: 630 }
  if (/\.(jpe?g|png)$/i.test(filename)) filename = filename.replace(/\.(jpe?g|png)$/i, '.webp')
  const absUrl = `${siteUrl}/posts/${slug}/${filename}`
  const altText = altMatch ? altMatch[1] : ''
  return `<img src="${absUrl}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}">`
}

const template = await fs.readFile('./templates/post.html', 'utf-8')

for (const slug of postDirs) {
  const postFolder = path.join(contentDir, slug)
  const mdPath = path.join(postFolder, 'index.md')
  let raw
  try { raw = await fs.readFile(mdPath, 'utf-8') } catch { console.warn(`no se encontró index.md en ${slug}`); continue }

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
        await sharp(assetPath).resize({ width: 1200 }).webp({ quality: 80 }).toFile(destPath.replace(/\.(jpe?g|png)$/i, '.webp'))
      } else {
        await fs.writeFile(destPath, data)
      }
    }
  } catch {}

  const finalHash = hash.digest('hex')
  if (fullRebuild || cache[`${slug}/index.md`] !== finalHash) {
    let htmlContent = md.render(body)
    htmlContent = htmlContent.replace(/<img\s+([^>]+?)>/g, (match, attrs) => processImgTag(attrs, slug, attributes.portada))

    const title = attributes.title || slug
    const description = attributes.description || ''
    const portada = attributes.portada
      ? `${siteUrl}/posts/${slug}/${attributes.portada.replace(/\.(jpe?g|png)$/i, '.webp')}`
      : ''
    const canonicalUrl = `${siteUrl}/posts/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''
    const date = attributes.date || new Date().toISOString()
    const authorJson = handle
      ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}`
      : `{"@type":"Person","name":"Desconocido"}`

    // SPA bootstrap script + redirect a #/posts/slug
    const spaMountScript = `<script>
      window.location.replace('#/posts/${slug}');
      document.addEventListener('DOMContentLoaded',()=>{window.__POST_CONTENT__=\`${htmlContent}\`;});
    </script>`

    let fullHtml = template
      .replace(/{{title}}/g, title)
      .replace(/{{description}}/g, description)
      .replace(/{{portada}}/g, portada)
      .replace(/{{canonicalUrl}}/g, canonicalUrl)
      .replace(/{{handle}}/g, handle)
      .replace(/{{date}}/g, date)
      .replace(/{{authorJson}}/g, authorJson)
      .replace(/{{htmlContent}}/g, `<div id="app"></div>${spaMountScript}`)

    await fs.writeFile(path.join(postsDir, slug), fullHtml)
    cache[`${slug}/index.md`] = finalHash
  } else console.log(`skip ${slug}/index.md (unchanged)`)

  indexItems.push({ slug, title: attributes.title || slug, date: attributes.date || '', tags: attributes.tags || [], url: `/posts/${slug}/` })
}

await fs.mkdir(outputDir, { recursive: true })
const indexPath = path.join(outputDir, 'index.json')
let prevIndex = '[]'
try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch {}
indexItems.sort((a,b)=> (a.date?new Date(a.date):new Date(0)) - (b.date?new Date(b.date):new Date(0))).reverse()
const newIndexStr = JSON.stringify(indexItems,null,2)
if (prevIndex !== newIndexStr) await fs.writeFile(indexPath,newIndexStr),console.log('index.json actualizado')
else console.log('index.json sin cambios')

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
await fs.writeFile(path.join(outputDir,'sitemap.xml'),sitemap)
console.log('sitemap.xml actualizado')

const robots = `User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`
await fs.writeFile(path.join(outputDir,'robots.txt'),robots)
console.log('robots.txt generado')

await fs.mkdir(path.dirname(cacheFile), { recursive: true })
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

try {
  const indexHtmlPath = path.join(outputDir, 'index.html')
  const notFoundPath = path.join(outputDir, '404.html')
  const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8')
  await fs.writeFile(notFoundPath, indexHtml)
  console.log('404.html generado a partir de index.html')
} catch (e) {
  console.error('no se pudo generar 404.html', e)
}

console.log('build completado: notas + index.json + sitemap.xml + robots.txt + cache + 404.html generados.')