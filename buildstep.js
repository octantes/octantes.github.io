import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sharp from 'sharp'

// IMAGES  | .jpg .jpeg .png      | sharp processing     | .webp       | <img width="..." height="..." loading="lazy">
// AUDIOS  | .mp3 .wav            | ffmpeg processing    | .ogg (opus) | <audio controls preload="auto">
// EMBED   |  yt or spotify url   | reduced embed iframe |  unchanged  | <div> <iframe>
// VIDEOS  | .mov .mp4 .avi .webm | direct copy          |  unchanged  | <video muted loop playsinline preload="auto" class="videosync">
// GIFS    | .gif                 | direct copy          |  unchanged  | <img loading="lazy">
// OTHER   |  any other           | direct copy          |  unchanged  | doesnt change original tag

// all files must be under 10MB and most should be under 5MB
// embeds will be processed in any note type as long as the url is from youtube or spotify (NEVER use shortened youtu.be url)
// optimization is handled only for images and audios, preprocess vidos and gifs before uploading
// for DISEÑO use [!TEXT] to divide from project assets to actual note

/* METADATA TEMPLATE

---
tags: [a, b, c]
type: diseño, desarrollo, musica, textos, juegos
title: titulo de la nota (nunca usar ":" en el titulo)
description: descripcion corta para seo
portada: portada.png
date: YYYY-MM-DD
handle: kaste OR [kaste, octantes] if multi-author
---

FULLSCREEN:   add "fullscreen: componente" to metadata to mount component in fullscreen layout (add imports to fullscreen.vue)
CUSTOM:       add "vuecomp: componente" to metadata to mount a component (add imports in content.vue)
TEXTOS:       add "style: trad" in metadata to remove the softbreaks rule from that specific note and set left alignment
JUEGOS:       just use "type: game" and use the custom vuecomp prop to mount the game in content.vue

- usar como maximo tres tags
- en la tabla solo se muestra hasta la primera coma- bloque de "novedades"

linea de ejemplo para el ancho: cruzar fue mi segundo proyecto de diseño basado en identidades ficticias, una excusa para seguir animando

*/

// MD IT INSTANCE RULES

const md = new MarkdownIt()

const defaultSoftbreak = md.renderer.rules.softbreak                             // normal linebreaks on tradnotes

const customSoftbreak = (tokens, idx, options, env, self) => {                   // render linebreaks only on text 

    const token = tokens[idx]

    if (token.level % 2 === 1) { return '<br />' }

    const prev = tokens[idx - 1]
    const next = tokens[idx + 1]

    const isAsset = (t) => t && t.type === 'inline' && (t.children.some(c => c.type === 'image') || t.content.match(/<iframe|<img/i))

    if (isAsset(prev) || isAsset(next)) { return '' }

    return '<br />'

}

function setCustomSoftbreak()   { md.renderer.rules.softbreak = customSoftbreak }
function unsetCustomSoftbreak() { md.renderer.rules.softbreak = defaultSoftbreak }

setCustomSoftbreak()

// VARIABLES

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

function renderType(body, attributes) {                                          // render body applying type logic 

  const type = attributes.type
  const isTrad = attributes.style === 'trad'

  switch (type) {

    case 'diseño': {

      let parts = body.split('[!TEXT]')
      let assetBlock = parts[0] || ''
      let noteBlock = parts.slice(1).join('[!TEXT]')

      const renderedAssets = md.render(assetBlock)
        .replace(/^\s*<p>(.*?)<\/p>\s*$/is, '$1')
        .replace(/<br\s*\/?>/gi, '')

      const noteBlockClass = isTrad ? 'S7TEXT-TRAD' : 'S7TEXT'

      return `${renderedAssets}${ noteBlock ? `<div class="${noteBlockClass}">${md.render(noteBlock)}</div>` : ''}`

    }

    default: {

        if (isTrad) { return `<div class="S6TRAD">${md.render(body)}</div>` }
        return md.render(body) 

    }

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
    return `<audio controls style="width: 100%" preload="auto" src="${absUrl}" aria-label="${altText}"></audio>`

  } else if (isYoutube) {

    let videoId = ''
    const ytMatch = filename.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (ytMatch && ytMatch[1]) { videoId = ytMatch[1] } else { return `<${tag} ${attrs}>` }
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
    return `<iframe width="560" height="315" src="${embedUrl}" title="YouTube Video" frameborder="0" allow="clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen class="YTVideo"> </iframe>`
    
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

async function convertImage(inputPath, destPath, width = 1200, quality = 80) {   // convert input image files to WEBP 

  try {

    const finalOutputPath = destPath.replace(/\.(jpe?g|png)$/i, '.webp')
    await sharp(inputPath).resize({ width: width, withoutEnlargement: true }).webp({ quality: quality }).toFile(finalOutputPath)
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

    for (const asset of assets) {

      const assetPath = path.join(assetsSrc, asset)
      const destPath = path.join(assetsDest, asset)
      const isImage = /\.(jpe?g|png)$/i.test(asset)
      
      if (isImage) {

        console.log(`converting global image ${asset} to WEBP...`)
        
        await convertImage(assetPath, destPath, 1200, 80)
        const thumbPath = destPath.replace(/\.(jpe?g|png)$/i, '-thumb.png') 
        await convertImage(assetPath, thumbPath, 400, 60)

      } else { await fs.copyFile(assetPath, destPath) }

    }

    console.log('assets copied and optimized to dist/assets')

  } catch(e) { console.warn('global assets not copied or optimized:', e) }

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
    const sidebarLinks = postDirs.map(p => `<li><a href="${webURL}/posts/${p.typeDir}/${p.slug}/">${p.slug.replace(/-/g, ' ')}</a></li>`).join('\n')

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

          console.log(`converting image ${asset.name} to WEBP (full & thumb)...`)
          finalOutputPath = await convertImage(assetPath, destPath, 1200, 80)
          const thumbDestPath = destPath.replace(/\.(jpe?g|png)$/i, '-thumb.png')
          await convertImage(assetPath, thumbDestPath, 400, 60)

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
    const rawPortada = attributes.portada ? attributes.portada.replace(/\[\[|\]\]/g, '') : ''
    const portadaUrl = rawPortada ? `${webURL}/posts/${postType}/${slug}/${rawPortada.replace(/\.(jpe?g|png)$/i, '.webp')}` : ''
    const canonicalUrl = `${webURL}/${postType}/${slug}/`

    const rawHandle = attributes.handle
    const handles = (Array.isArray(rawHandle) ? rawHandle : (rawHandle ? [rawHandle] : ['kaste'])).map(h => String(h).replace(/^@/, ''))
    const primaryHandle = handles[0] // only one handle in html for SEO
    const articleJson = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
      "headline": attributes.title || slug,
      "image": portadaUrl || `${webURL}/assets/portada.webp`,
      "author": { "@type": "Person", "name": primaryHandle, "url": primaryHandle ? `https://x.com/${primaryHandle}` : `${webURL}/about` },
      "publisher": { "@type": "Organization", "name": "octantes.net", "logo": { "@type": "ImageObject", "@id": `${webURL}/assets/logo.webp`, "url": `${webURL}/assets/logo.webp` } },
      "datePublished": isoDate,
      "dateModified": isoDate,
      "description": attributes.description || 'descripción corta de la nota',
      "keywords": (attributes.tags || []).join(', ')
    });

    const finalArticleJson = articleJson
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    if (fullRebuild || cache[`${postType}/${slug}/index.md`] !== finalHash) {

      const isTradStyle = attributes.style === 'trad'

      if (isTradStyle) { unsetCustomSoftbreak(); console.log(`using 'trad' style on ${slug} - default softbreak`) }
      else { setCustomSoftbreak() }

      let htmlContent = renderType(body, attributes).trim()
      htmlContent = htmlContent.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(tagName, attrs, postType, slug, attributes.portada))

      if (isTradStyle) { setCustomSoftbreak() }

      const internalLinkRegex = new RegExp(`href=['"](${webURL}|\\/)`, 'i')

      htmlContent = htmlContent.replace(/<a\s+(.*?)href=['"](.*?)['"](.*?)\s*>/gi, (match, before, href, after) => {
          if (internalLinkRegex.test(match) || href.startsWith('#')) { return match }
          if (!/(target\s*=\s*['"]_blank['"])/i.test(match)) { return `<a ${before}href="${href}"${after} target="_blank" rel="noopener noreferrer">` }
          return match
      })

      const staticNav = `
      <nav class="static-nav">
        <a href="/archivo.html">← VOLVER AL ARCHIVO</a>
        <span>// ${attributes.title || slug}</span>
      </nav>`

      let fullHtml = template
        .replace(/{{title}}/g, attributes.title || slug)
        .replace(/{{description}}/g, attributes.description || '')
        .replace(/{{portada}}/g, portadaUrl)
        .replace(/{{canonicalUrl}}/g, canonicalUrl)
        .replace(/{{handle}}/g, primaryHandle)
        .replace(/{{date}}/g, formatted)
        .replace(/{{articleJson}}/g, finalArticleJson)
        .replace(/{{htmlContent}}/g, htmlContent)
        .replace(/{{webURL}}/g, webURL)
        .replace(/{{sidebarLinks}}/g, sidebarLinks)

      await fs.writeFile(path.join(noteOutputDir, 'index.html'), fullHtml)
      cache[`${postType}/${slug}/index.md`] = finalHash

    } else { console.log(`skipping ${slug}/index.md (unchanged)`) }

    indexItems.push({
      slug,
      title: attributes.title || slug,
      description: attributes.description || '',
      type: postType || 'textos',
      tags: attributes.tags || [],
      portada: portadaUrl,
      handle: handles,
      date: formatted,
      isoDate: isoDate,
      url: `/posts/${postType}/${slug}/`,
      vuecomp: attributes.vuecomp || null,
      fullscreen: attributes.fullscreen || null
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

function generateGroupedSidebar() {                                              // create sidebar for basic archive webpage 

  const groups = {}

  indexItems.forEach(item => {

    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)

  })

  const order = ['textos', 'diseño', 'desarrollo', 'musica', 'juegos']
  
  Object.keys(groups).forEach(key => { if (!order.includes(key)) order.push(key) })

  let html = ''

  order.forEach(type => {

    if (groups[type]) {

      html += `<li class="cat-header">${type}</li>`
      groups[type].sort((a,b) => new Date(b.isoDate) - new Date(a.isoDate)).forEach(p => { html += `<li><a href="${webURL}${p.url}">${p.title}</a></li>` })

    }

  })
  
  return html

}

async function writeBasicIndex() {                                               // create archivo.html with basic site structure 
 
  const sidebarHTML = generateGroupedSidebar()
  const sortedItems = [...indexItems].sort((a,b)=> new Date(b.isoDate) - new Date(a.isoDate))

  const mainContent =
  `
    <header class="post-header">
      <h1>abriendo portales a universos alternativos</h1>
      <div class="meta">archivo plano // octantes.net</div>
    </header>
    
    <p>seleccioná una nota del menú izquierdo para comenzar la lectura.</p>
    
    <div class="separator-margin">últimas actualizaciones</div>

    <ul class="article-list">
      ${sortedItems.slice(0, 15).map(i => `
        <li>
          <a href="${i.url}">
            <span class="list-span">[${i.date}]</span>
            ${i.title}
          </a>
        </li>
      `).join('\n')}
    </ul>
  `

  const basicHtml = 
  `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>octantes.net - archivo</title>
    <link rel="stylesheet" href="/assets/neocities.css">
    <script defer src="https://cloud.umami.is/script.js" data-website-id="09728bae-6bcd-4609-a854-f6b016251416"></script>
    <meta name="google-site-verification" content="dLiN5dsyf2dn83nTH9o-9xwHc7YUgZs4dR2ojjJ4OAM" />
  </head>
  <body>
  
    <aside class="static-nav">
      <div class="sidebar-content">
      
        <div class="site-logo">OCTANTES</div>
        <div class="site-subtitle">tejiendo hechizos</div>
        
        <div class="profile-box">
          <a href="https://x.com/octantes" target="_blank" class="profile-link">
            <img src="/assets/kaste.webp" alt="kaste avatar" class="profile-img">
          </a>
          <div class="profile-text">
            <strong>kaste</strong><br>
            <i>música, diseño, desarrollo y escritura</i>
          </div>
        </div>
        
        <nav class="nav-links">
          <a href="/archivo.html">[ARCHIVO]</a>
          <a href="/">[PORTAL]</a>
          <a href="/feed.xml">[RSS]</a>
        </nav>
        
        <div class="separator-nomargin">artículos</div>
        <ul class="article-list">${sidebarHTML}</ul>
        
      </div>
    </aside>
    
    <main class="post-content">
      ${mainContent}
    </main>
    
  </body>
  </html>
  `

  await fs.writeFile(path.join(outputDir, 'archivo.html'), basicHtml)
  console.log('archivo.html generated (clean styles)')

}

async function updateSidebars() {                                                // update old archive website sidebars 

  const sidebarHTML = generateGroupedSidebar()
  
  for (const item of indexItems) {

    const filePath = path.join(outputDir, 'posts', item.type, item.slug, 'index.html')

    try {

      let html = await fs.readFile(filePath, 'utf-8')
      html = html.replace(/<ul class="article-list">[\s\S]*?<\/ul>/, `<ul class="article-list">${sidebarHTML}</ul>`)
      await fs.writeFile(filePath, html)

    } catch (e) { console.error(`Error updating sidebar for ${item.slug}`, e) }

  }

  console.log('sidebars updated globally')

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

async function writeFeed() {                                                     // create RSS feed XML 

  await fs.mkdir(outputDir, { recursive: true })
  const feedPath = path.join(outputDir, 'feed.xml')
  
  const now = new Date().toUTCString()
  const feedTitle = 'octantes.net'
  const feedUrl = `${webURL}/feed.xml`
  const feedDescription = 'un portal web de contenido multimedia, sin algoritmos ni intermediarios'

  const channelItems = indexItems.map(post => {
    const postUrl = `${webURL}${post.url}`
    const postDate = new Date(post.isoDate).toUTCString()
    const escapedDescription = post.description
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `<item>
      <title>${post.title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${postDate}</pubDate>
      <description>${escapedDescription}</description>
      <author>kaste@octantes.net (kaste)</author>
    </item>`
  }).join('\n')

  const feedXml = 
  `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${feedTitle}</title>
    <link>${webURL}</link>
    <description>${feedDescription}</description>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>buildstep.js (custom)</generator>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${channelItems}
  </channel>
  </rss>`

  let prevFeed = ''
  try { prevFeed = await fs.readFile(feedPath, 'utf-8') } catch {}

  if (prevFeed !== feedXml) { await fs.writeFile(feedPath, feedXml); console.log('feed.xml updated') }
  else { console.log('skipping feed.xml (unchanged)') }

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
  await updateSidebars()
  await writeBasicIndex()
  await writeSitemap()
  await writeFeed()
  await finalizeBuild()

  console.log('build completed successfully: static notes, index, SEO files, and cache updated.')

}

main().catch(err => { console.error('BUILD FAILED:', err); process.exit(1) })