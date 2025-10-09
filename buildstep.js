import { spawn } from 'child_process'
import ffmpegStatic from 'ffmpeg-static'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sharp from 'sharp'

const md = new MarkdownIt()
const cacheFile = path.resolve('.build-cache.json')
const template = await fs.readFile('./templates/post.html', 'utf-8')
const webURL = 'https://octantes.github.io'
const contentDir = './content'
const outputDir = './dist'

let cache = {}
let postDirs = []
let fullRebuild = false
const indexItems = []

// MD TO HTML BODY PROCESSING

function renderType(body, type, portada) {                                                // render body applying type logic 

  switch (type) {

    case 'design': {                                                    // separar assets de texto con [!S7TEXT] 

      let parts = body.split('[!TEXT]')
      let assetBlock = parts[0] || ''
      let noteBlock = parts.slice(1).join('[!TEXT]')

      const renderedAssets = md.render(assetBlock).replace(/<p>\s*((?:<img[^>]+\/?>\s*)+)<\/p>/gi, '$1')

      return `${renderedAssets}${ noteBlock ? `<div class="S7TEXT">${md.render(noteBlock)}</div>` : ''}`

    }

    case 'dev': return md.render(body)
    case 'note': return md.render(body)
    case 'music': return md.render(body)
    default: return md.render(body)

  }

}

function processAssets(tag, attrs, type, slug, portada) {                        // replace asset src for optimized HTML tag 

  const srcMatch = attrs.match(/src=['"]([^'"]+)['"]/)

  if (!srcMatch) return tag
  let filename = srcMatch[1]

  const altMatch = attrs.match(/alt=['"]([^'"]*)['"]/)
  const altText = altMatch ? altMatch[1] : ''
  const isImage = /\.(jpe?g|png)$/i.test(filename)
  const isVideo = /\.(mov|mp4|avi|webm)$/i.test(filename)

  if (isImage) {

    let dimensions = { width: 600, height: 400 }
    if (filename === portada) dimensions = { width: 1200, height: 630 }
    filename = filename.replace(/\.(jpe?g|png)$/i, '.webp') 
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    
    return `<img src="${absUrl}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}">`

  } 
  
  else if (isVideo) {

    filename = filename.replace(/\.(mov|mp4|avi|webm)$/i, '.webm')
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<video src="${absUrl}" autoplay muted loop playsinline preload="auto" alt="${altText}"></video>`

  } 
  
  else { return `<img ${attrs}>` }

}

// ASSET CONVERSION UTILITIES

async function convertImage(assetPath, destPath) {                               // convert input image files to WEBP 

  const outputPath = destPath.replace(/\.(jpe?g|png)$/i, '.webp')

  await sharp(assetPath)
    .resize({ width: 1200 })       // max width
    .webp({ quality: 80 })         // optimized convert
    .toFile(outputPath)

  return outputPath

}

async function convertVideo(inputPath, outputPath) {                             // convert input video files to WEBM 

  return new Promise((resolve, reject) => {
    
    const finalOutputPath = outputPath.replace(/\.(mov|mp4|avi|webm)$/i, '.webm');

    const args = [
      '-i', inputPath,             // input file
      '-c:v', 'libvpx-vp9',        // VP9 codec
      '-b:v', '1M',                // video bitrate
      '-pix_fmt', 'yuv420p',       // pixel format compatibility
      '-c:a', 'libopus',           // audio codec
      '-an',                       // strip audio
      '-y',                        // overwrite output files without asking
      finalOutputPath              // output file
    ]
    
    const ffmpegProcess = spawn(ffmpegStatic, args)

    ffmpegProcess.on('close', (code) => { if (code === 0) { resolve() } else { reject(new Error(`FFMPEG conversion failed with code ${code} for ${inputPath}`)) } })
    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process: ${err.message}`)) })

  })

}

// SETUP BUILD AND PROCESS

async function setupBuild() {                                                    // load cache and prepare output directory 

  try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) }
  catch { console.log("Hash cache not found, recreating") }

  try { postDirs = (await fs.readdir(contentDir, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name) } 
  catch { postDirs = []; console.log("Posts directory not found, returning empty array") }

  const postsDir = path.join(outputDir, 'posts')
  
  try { await fs.access(postsDir) }
  catch { fullRebuild = true; await fs.mkdir(postsDir, { recursive: true }) }

}

async function copyAssets() {                                                    // copy global asset folder to output directory 

  try {

    const assetsSrc = path.join(contentDir, 'assets')
    const assetsDest = path.join(outputDir, 'assets')

    await fs.mkdir(assetsDest, { recursive: true })

    const assets = await fs.readdir(assetsSrc)

    for (const asset of assets) { await fs.copyFile(path.join(assetsSrc, asset), path.join(assetsDest, asset)) }

    console.log('Assets copied to dist/assets')

  } catch(e) { console.warn('Global assets not copied:', e) }

}

async function cleanOrphans() {                                                  // delete orphans from cache and output directory 

  const postsDir = path.join(outputDir, 'posts')

  try {

    const typeDirs = await fs.readdir(postsDir, { withFileTypes: true })

    for (const tdir of typeDirs) {

      if (!tdir.isDirectory()) continue

      const typePath = path.join(postsDir, tdir.name)
      const children = await fs.readdir(typePath, { withFileTypes: true })

      for (const child of children) {

        if (!child.isDirectory()) continue
        const slug = child.name

        if (!postDirs.includes(slug)) { await fs.rm(path.join(typePath, slug), { recursive: true, force: true }) }

      }
    }
  } catch {}

  for (const key of Object.keys(cache)) { const slug = key.split('/')[0]; if (!postDirs.includes(slug)) delete cache[key] }

}

async function processPosts() {                                                  // process and convert images from markdown and assets 

  for (const slug of postDirs) {

    const postFolder = path.join(contentDir, slug)
    const mdPath = path.join(postFolder, 'index.md')

    let raw

    try { raw = await fs.readFile(mdPath, 'utf-8') }
    catch { console.warn(`index.md not found in ${slug}, skipping`); continue }

    const { attributes, body } = fm(raw)
    const type = attributes.type || 'note'
    const noteOutputDir = path.join(outputDir, 'posts', type, slug)

    await fs.mkdir(noteOutputDir, { recursive: true })

    const hash = crypto.createHash('sha256').update(raw)

    try {

      const assets = await fs.readdir(postFolder, { withFileTypes: true })

      for (const asset of assets) {

        if (!asset.isFile() || asset.name === 'index.md') continue

        const assetPath = path.join(postFolder, asset.name)
        const destPath  = path.join(noteOutputDir, asset.name)
        const isImage   = /\.(jpe?g|png)$/i.test(asset.name)
        const isVideo   = /\.(mov|mp4|avi|webm)$/i.test(asset.name)

        let finalOutputPath = destPath;

        if (isImage) {

          finalOutputPath = await convertImage(assetPath, destPath)

        } else if (isVideo) {

          console.log(`Converting video ${asset.name} to WEBM...`)
          finalOutputPath = destPath.replace(/\.(mov|mp4|avi|webm)$/i, '.webm')
          await convertVideo(assetPath, finalOutputPath)

        } else {

          const data = await fs.readFile(assetPath)
          await fs.writeFile(destPath, data)
          hash.update(data)
          continue

        }

        const finalData = await fs.readFile(finalOutputPath)
        hash.update(finalData)

      }

    } catch(e) { console.error(`Error processing assets for ${slug}:`, e) }

    const finalHash = hash.digest('hex')
    const dateObj = attributes.date ? new Date(attributes.date) : new Date()
    const formatted = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`
    const isoDate = attributes.date || dateObj.toISOString() 
    const portadaUrl = attributes.portada ? `${webURL}/posts/${type}/${slug}/${attributes.portada.replace(/\.(jpe?g|png)$/i, '.webp')}` : ''
    const canonicalUrl = `${webURL}/${type}/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''
    const authorJson = handle ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}` : `{"@type":"Person","name":"Desconocido"}`

    if (fullRebuild || cache[`${slug}/index.md`] !== finalHash) {

      let htmlContent = renderType(body, attributes.type, attributes.portada).trim()
      htmlContent = htmlContent.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(match, attrs, type, slug, attributes.portada))

      let fullHtml = template
        .replace(/{{title}}/g, attributes.title || slug)
        .replace(/{{description}}/g, attributes.description || '')
        .replace(/{{portada}}/g, portadaUrl)
        .replace(/{{canonicalUrl}}/g, canonicalUrl)
        .replace(/{{handle}}/g, handle)
        .replace(/{{date}}/g, formatted)
        .replace(/{{authorJson}}/g, authorJson)
        .replace(/{{htmlContent}}/g, htmlContent)

      await fs.writeFile(path.join(noteOutputDir, 'index.html'), fullHtml)
      cache[`${slug}/index.md`] = finalHash

    } else { console.log(`Skipping ${slug}/index.md (unchanged)`) }

    indexItems.push({
      slug,
      title: attributes.title || slug,
      description: attributes.description || '',
      type: attributes.type || 'note',
      tags: attributes.tags || [],
      portada: portadaUrl,
      handle: attributes.handle || 'kaste',
      date: formatted,
      isoDate: isoDate,
      url: `/posts/${type}/${slug}/`,
    })

  }

}

async function writeIndex() {                                                    // create index.json with processed post metadata 

  await fs.mkdir(outputDir, { recursive: true })
  const indexPath = path.join(outputDir, 'index.json')
  
  indexItems.sort((a,b)=> (a.date ? new Date(a.date) : new Date(0)) - (b.date ? new Date(b.date) : new Date(0))).reverse()
  const newIndexStr = JSON.stringify(indexItems, null, 2)
  
  let prevIndex = '[]'
  try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch {}

  if (prevIndex !== newIndexStr) { await fs.writeFile(indexPath, newIndexStr); console.log('index.json actualizado') }
  else { console.log('Skipping index.json (unchanged)') }

}

async function writeSitemap() {                                                  // create sitemap and robots.txt 

  const staticPages = [
    { url: '/', lastmod: new Date().toISOString() },
    { url: '/about/', lastmod: new Date().toISOString() },
    { url: '/contact/', lastmod: new Date().toISOString() }
  ]

  const postPages = indexItems.map( post => ({ url:post.url,lastmod:post.isoDate }) )
  const allPages = [...staticPages,...postPages]
  const sitemapItems = allPages.map( p =>
    `<url>
      <loc>${webURL}${p.url}</loc>
      <lastmod>${p.lastmod}</lastmod>
    </url>`
  ).join('\n')

  const sitemap = 
  `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapItems}
  </urlset>`

  await fs.writeFile(path.join(outputDir,'sitemap.xml'),sitemap)
  console.log('sitemap.xml actualizado')

  const robots = `User-agent: *
  Disallow:

  Sitemap: ${webURL}/sitemap.xml
  `
  await fs.writeFile(path.join(outputDir,'robots.txt'),robots)
  console.log('robots.txt generated')

}

async function finalizeBuild() {                                                 // update cache and create 404 from index 

  await fs.mkdir(path.dirname(cacheFile), { recursive: true })
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

  try {
    const notFoundPath = path.join(outputDir, '404.html')
    const indexHtmlPath = path.join(outputDir, 'index.html') 
    await fs.copyFile(indexHtmlPath, notFoundPath)
    console.log('404.html generado a partir de index.html')
  } catch (e) { console.warn('Could not generate 404.html (index.html missing, is Vite build complete?):', e.message) }

}

main().catch(err => { console.error('BUILD FAILED:', err); process.exit(1) })

async function main() {

  await setupBuild()
  await copyAssets()
  await cleanOrphans()
  await processPosts()
  await writeIndex()
  await writeSitemap()
  await finalizeBuild()
  
  console.log('build completed successfully: static notes, index, SEO files, and cache updated.')

}