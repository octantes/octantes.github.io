import { spawn } from 'child_process'
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

function renderType(body, type, portada) {                                       // render body applying type logic 

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
  const isGif = /\.gif$/i.test(filename)
  const isAudio = /\.(mp3|wav)$/i.test(filename)
  const isYoutube = /(youtube\.com|youtu\.be)\/(embed\/|v\/|watch\?v=|\/)/i.test(filename)

  if (isImage) {

    let dimensions = { width: 600, height: 400 }
    if (filename === portada) dimensions = { width: 1200, height: 630 }
    filename = filename.replace(/\.(jpe?g|png)$/i, '.webp') 
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    
    return `<img src="${absUrl}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}">`

  } else if (isVideo) {

    filename = filename.replace(/\.(mov|mp4|avi|webm)$/i, '.webm')
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<video src="${absUrl}" muted loop playsinline preload="auto" class="videosync" alt="${altText}"></video>`

  } else if (isGif) {

    filename = filename.replace(/\.gif$/i, '.webm')
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<video src="${absUrl}" muted loop playsinline preload="auto" class="videosync" alt="${altText}"></video>`

  } else if (isAudio) {

    filename = filename.replace(/\.(mp3|wav)$/i, '.ogg')
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<audio controls preload="auto" src="${absUrl}" aria-label="${altText}"></audio>`

  } else if (isYoutube) {

    let videoId = ''
    const ytMatch = filename.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (ytMatch && ytMatch[1]) { videoId = ytMatch[1] } else { return `<${tag} ${attrs}>` }
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
    return `<div class="YTFrame"> <iframe src="${embedUrl}" title="YouTube Video" frameborder="0" allow="clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen class="YTVideo"> </iframe> </div>`
    
  }
  
  else { return `<${tag} ${attrs}>` }

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
      '-c:v', 'libvpx',            // VP8 codec
      '-b:v', '4M',                // video bitrate
      '-pix_fmt', 'yuv420p',       // pixel format compatibility
      '-c:a', 'libopus',           // audio codec
      '-an',                       // strip audio
      '-y',                        // overwrite output files without asking
      finalOutputPath              // output file
    ]
    
    const ffmpegProcess = spawn('ffmpeg', args)

    ffmpegProcess.on('close', (code) => { if (code === 0) { resolve() } else { reject(new Error(`FFMPEG conversion failed with code ${code} for ${inputPath}`)) } })
    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process: ${err.message}`)) })

  })

}

async function convertGif(inputPath, outputPath) {                               // convert input gif files to WEBM 

  return new Promise(async (resolve, reject) => {

    const finalOutputPath = outputPath.replace(/\.gif$/i, '.webm')
    let ffmpegErrorOutput = ''

    const gifBuffer = await fs.readFile(inputPath).catch(err => { reject(new Error(`Error reading input file before piping: ${err.message}`)); return null })

    if (!gifBuffer) return

    const args = [ 
      '-f', 'gif',
      '-i', 'pipe:0',
      '-c:v', 'libvpx',
      '-b:v', '1M',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-loop', '0',
      '-vsync', '0',
      '-y',
      finalOutputPath
    ]

    const ffmpegProcess = spawn('ffmpeg', args)
    
    ffmpegProcess.stderr.on('data', (data) => { ffmpegErrorOutput += data.toString() })

    ffmpegProcess.on('close', (code) => { 
      if (code === 0) { resolve() } else {
        const fullError = `FFMPEG GIF conversion failed with code ${code} for ${inputPath}.\nFFMPEG Output:\n${ffmpegErrorOutput}`
        reject(new Error(fullError))
      }
    })

    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process: ${err.message}`)) })
    ffmpegProcess.stdin.write(gifBuffer)
    ffmpegProcess.stdin.end()
  })
}

async function convertAudio(inputPath, outputPath) {                             // convert input audio files to OGG 

  return new Promise((resolve, reject) => {
    
    const finalOutputPath = outputPath.replace(/\.(mp3|wav)$/i, '.ogg');

    const args = [
      '-i', inputPath,             // input file
      '-c:a', 'libopus',           // audio codec: opus
      '-b:a', '96k',               // audio bitrate
      '-y',                        // overwrite output files without asking
      finalOutputPath              // output file
    ]
    
    const ffmpegProcess = spawn('ffmpeg', args)

    ffmpegProcess.on('close', (code) => { 
      if (code === 0) { resolve(finalOutputPath) }
      else { reject(new Error(`FFMPEG audio conversion failed with code ${code} for ${inputPath}`)) } 
    })
    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process for audio: ${err.message}`)) })

  })

}

// SETUP BUILD AND PROCESS

async function setupBuild() {                                                    // load cache and prepare output directory 

  try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) }
  catch { console.log("Hash cache not found, recreating") }

  postDirs = []
  
  try { 
    const typeDirs = (await fs.readdir(contentDir, { withFileTypes: true })).filter(d => d.isDirectory())
    for (const tdir of typeDirs) {
        if (tdir.name === 'assets') continue
        const postsInTypeDir = (await fs.readdir(path.join(contentDir, tdir.name), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => ({ slug: d.name, typeDir: tdir.name }))
        postDirs.push(...postsInTypeDir)
    }
  } catch (e) { postDirs = []; console.error("Error reading content directory:", e.message) }

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
        const isPostActive = postDirs.some(p => p.slug === slug) 

        if (!isPostActive) { await fs.rm(path.join(typePath, slug), { recursive: true, force: true }) }

      }
    }
  } catch {}

  for (const key of Object.keys(cache)) { const slug = key.split('/')[0]; const isPostActive = postDirs.some(p => p.slug === slug); if (!isPostActive) delete cache[key] }

}

async function processPosts() {                                                  // process and convert images from markdown and assets 

  for (const post of postDirs) {

    const slug = post.slug
    const typeFolder = post.typeDir
    const postFolder = path.join(contentDir, typeFolder, slug)
    const mdPath = path.join(postFolder, 'index.md')

    let raw

    try { raw = await fs.readFile(mdPath, 'utf-8') }
    catch { console.warn(`index.md not found in ${typeFolder}, skipping`); continue }

    const { attributes, body } = fm(raw)
    const postType = attributes.type || typeFolder
    const noteOutputDir = path.join(outputDir, 'posts', postType, slug)

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
        const isGif     = /\.gif$/i.test(asset.name)

        let finalOutputPath = destPath;

        if (isImage) {

          finalOutputPath = await convertImage(assetPath, destPath)

        } else if (isVideo) {

          console.log(`converting video ${asset.name} to webm...`)
          finalOutputPath = destPath.replace(/\.(mov|mp4|avi|webm)$/i, '.webm')
          await convertVideo(assetPath, finalOutputPath)

        } else if (isGif) {

          console.log(`converting gif ${asset.name} to webm...`)
          finalOutputPath = destPath.replace(/\.gif$/i, '.webm')
          await convertGif(assetPath, finalOutputPath)

        } else if (isAudio) {

          console.log(`converting audio ${asset.name} to OGG (Opus)...`)
          finalOutputPath = destPath.replace(/\.(mp3|wav)$/i, '.ogg') 
          await convertAudio(assetPath, finalOutputPath)
        
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
    const portadaUrl = attributes.portada ? `${webURL}/posts/${postType}/${slug}/${attributes.portada.replace(/\.(jpe?g|png)$/i, '.webp')}` : ''
    const canonicalUrl = `${webURL}/${postType}/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''
    const authorJson = handle ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}` : `{"@type":"Person","name":"Desconocido"}`

    if (fullRebuild || cache[`${slug}/index.md`] !== finalHash) {

      let htmlContent = renderType(body, attributes.type, attributes.portada).trim()
      htmlContent = htmlContent.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(match, attrs, postType, slug, attributes.portada))

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
      type: postType || 'note',
      tags: attributes.tags || [],
      portada: portadaUrl,
      handle: attributes.handle || 'kaste',
      date: formatted,
      isoDate: isoDate,
      url: `/posts/${postType}/${slug}/`,
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