import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sharp from 'sharp'

// all files must be under 10MB and most should be under 5MB
// embeds will be processed in any note type as long as the url is from youtube or spotify
// optimization is handled only for images and audios, preprocess vidos and gifs before uploading

// IMAGES  | .jpg .jpeg .png      | sharp processing     | .webp       | <img width="..." height="..." loading="lazy">
// AUDIOS  | .mp3 .wav            | ffmpeg processing    | .ogg (opus) | <audio controls preload="auto">
// N9EMBED |  yt or spotify url   | reduced embed iframe |  unchanged  | <div> <iframe>
// VIDEOS  | .mov .mp4 .avi .webm | direct copy          |  unchanged  | <video muted loop playsinline preload="auto" class="videosync">
// GIFS    | .gif                 | direct copy          |  unchanged  | <img loading="lazy">
// OTHER   |  any other           | direct copy          |  unchanged  | doesnt change original tag

// for DESIGN use [!TEXT] to divide from project assets to actual note

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

    case 'design': {

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
  const isGif = /\.gif$/i.test(filename)
  const isVideo = /\.(mov|mp4|avi|webm)$/i.test(filename) 
  const isAudio = /\.(mp3|wav)$/i.test(filename)
  const isYoutube = /(youtube\.com|youtu\.be)\/(embed\/|v\/|watch\?v=|\/)/i.test(filename)
  const isSpotify = /(spotify\.com\/(track|album|playlist|episode)\/|spotify:)/i.test(filename)

  if (isImage) {

    let dimensions = { width: 600, height: 400 }
    if (filename === portada) dimensions = { width: 1200, height: 630 }
    filename = filename.replace(/\.(jpe?g|png)$/i, '.webp') 
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<img src="${absUrl}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}">`

  } else if (isGif) {
    
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<img src="${absUrl}" loading="lazy" alt="${altText}">`

  } else if (isVideo) {
    
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<video src="${absUrl}" muted loop playsinline preload="auto" class="videosync" aria-label="${altText}"></video>`

  } else if (isAudio) {

    filename = filename.replace(/\.(mp3|wav)$/i, '.ogg')
    const absUrl = `${webURL}/posts/${type}/${slug}/${filename}`
    return `<audio controls preload="auto" src="${absUrl}" aria-label="${altText}"></audio>`

  } else if (isYoutube) {

    let videoId = ''
    const ytMatch = filename.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (ytMatch && ytMatch[1]) { videoId = ytMatch[1] } else { return `<${tag} ${attrs}>` }
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
    return `<iframe src="${embedUrl}" title="YouTube Video" frameborder="0" allow="clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen class="YTVideo"> </iframe>`
    
  } else if (isSpotify) {

    let spotifyUrl = filename
    let embedUrl = ''
    if (spotifyUrl.includes('/embed/')) { embedUrl = spotifyUrl.replace(/\/embed\/?/, '/embed/') }
    else {
      const match = spotifyUrl.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
      if (match && match[1] && match[2]) { 
        const contentType = match[1]
        const contentId = match[2]
        embedUrl = `https://open.spotify.com/embed/${contentType}/${contentId}?utm_source=generator`
      } else { return `<${tag} ${attrs}>` }
    }

    return `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`

  }
  
  else { return `<${tag} ${attrs}>` }

}

// ASSET CONVERSION UTILITIES

async function convertImage(inputPath, destPath) {                               // convert input image files to WEBP 

  try {

    const finalOutputPath = destPath.replace(/\.(jpe?g|png)$/i, '.webp')
    await sharp(inputPath).resize({ width: 1200 }).webp({ quality: 80 }).toFile(finalOutputPath)
    return finalOutputPath

  } catch(e) { throw new Error(`error processing image ${inputPath}: ${e.message}`) }

}

async function convertAudio(inputPath, destPath) {                               // convert input audio files to OGG 

  return new Promise((resolve, reject) => {
    
    const finalOutputPath = destPath.replace(/\.(mp3|wav)$/i, '.ogg');
    const args = [ '-i', inputPath, '-c:a', 'libopus', '-b:a', '96k', '-y', finalOutputPath ]
    const ffmpegProcess = spawn('ffmpeg', args)

    ffmpegProcess.on('close', (code) => { if (code === 0) { resolve(finalOutputPath) } else { reject(new Error(`FFMPEG audio conversion failed with code ${code} for ${inputPath}`)) } })
    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process for audio: ${err.message}`)) })

  })

}

async function convertVideo(inputPath, destPath) {                               // just copies video files to output 

  try {

    const finalOutputPath = destPath
    const data = await fs.readFile(inputPath)
    await fs.writeFile(finalOutputPath, data)
    return finalOutputPath

  } catch(e) { throw new Error(`error copying video ${inputPath}: ${e.message}`) }

}

async function convertGif(inputPath, destPath) {                                 // just copies video files to output 

  try {

    const finalOutputPath = destPath
    const data = await fs.readFile(inputPath)
    await fs.writeFile(finalOutputPath, data)
    return finalOutputPath

  } catch(e) { throw new Error(`error copying gif ${inputPath}: ${e.message}`) }

}

// SETUP BUILD AND PROCESS

async function setupBuild() {                                                    // load cache and prepare output directory 

  try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) }
  catch { console.log("hash cache not found, recreating") }

  postDirs = []
  
  try { 
    const typeDirs = (await fs.readdir(contentDir, { withFileTypes: true })).filter(d => d.isDirectory())
    for (const tdir of typeDirs) {
        if (tdir.name === 'assets') continue
        const postsInTypeDir = (await fs.readdir(path.join(contentDir, tdir.name), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => ({ slug: d.name, typeDir: tdir.name }))
        postDirs.push(...postsInTypeDir)
    }
  } catch (e) { postDirs = []; console.error("error reading content directory:", e.message) }

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

    console.log('assets copied to dist/assets')

  } catch(e) { console.warn('global assets not copied:', e) }

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
        const isAudio = /\.(mp3|wav)$/i.test(asset.name)
        const isImage   = /\.(jpe?g|png)$/i.test(asset.name)
        const isVideo   = /\.(mov|mp4|avi|webm)$/i.test(asset.name)
        const isGif     = /\.gif$/i.test(asset.name)

        let finalOutputPath = destPath;

        if (isImage) {

          console.log(`converting image ${asset.name} to WEBP...`)
          finalOutputPath = await convertImage(assetPath, destPath)

        } else if (isVideo) {

          console.log(`copying video ${asset.name} without processing...`)
          finalOutputPath = await convertVideo(assetPath, destPath)

        } else if (isGif) {

          console.log(`copying gif ${asset.name} without processing...`)
          finalOutputPath = await convertGif(assetPath, destPath)

        } else if (isAudio) {

          console.log(`converting audio ${asset.name} to OGG...`)
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

    } catch(e) { console.error(`error processing assets for ${slug}:`, e) }

    const finalHash = hash.digest('hex')
    const dateObj = attributes.date ? new Date(attributes.date) : new Date()
    const formatted = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`
    const isoDate = attributes.date || dateObj.toISOString() 
    const portadaUrl = attributes.portada ? `${webURL}/posts/${postType}/${slug}/${attributes.portada.replace(/\.(jpe?g|png)$/i, '.webp')}` : ''
    const canonicalUrl = `${webURL}/${postType}/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''
    const authorJson = handle ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}` : `{"@type":"Person","name":"Desconocido"}`

    if (fullRebuild || cache[`${postType}/${slug}/index.md`] !== finalHash) {

      let htmlContent = renderType(body, attributes.type, attributes.portada).trim()
      htmlContent = htmlContent.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(tagName, attrs, postType, slug, attributes.portada))

      const internalLinkRegex = new RegExp(`href=['"](${webURL}|\\/)`, 'i')

      htmlContent = htmlContent.replace(/<a\s+(.*?)href=['"](.*?)['"](.*?)\s*>/gi, (match, before, href, after) => {
          if (internalLinkRegex.test(match) || href.startsWith('#')) { return match }
          if (!/(target\s*=\s*['"]_blank['"])/i.test(match)) { return `<a ${before}href="${href}"${after} target="_blank" rel="noopener noreferrer">` }
          return match
      })

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
      cache[`${postType}/${slug}/index.md`] = finalHash

    } else { console.log(`skipping ${slug}/index.md (unchanged)`) }

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
  
  indexItems.sort((a,b)=> new Date(b.isoDate) - new Date(a.isoDate))
  const newIndexStr = JSON.stringify(indexItems, null, 2)
  
  let prevIndex = '[]'
  try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch {}

  if (prevIndex !== newIndexStr) { await fs.writeFile(indexPath, newIndexStr); console.log('index.json updated') }
  else { console.log('skipping index.json (unchanged)') }

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
  console.log('sitemap.xml updated')

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
    console.log('404.html generated from index.html')
  } catch (e) { console.warn('could not generate 404.html (index.html missing, did vite build?):', e.message) }

}

async function main() {                                                          // main build process 

  await setupBuild()
  await copyAssets()
  await cleanOrphans()
  await processPosts()
  await writeIndex()
  await writeSitemap()
  await finalizeBuild()

  console.log('build completed successfully: static notes, index, SEO files, and cache updated.')

}

main().catch(err => { console.error('BUILD FAILED:', err); process.exit(1) })