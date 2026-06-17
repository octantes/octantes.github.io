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
vuecomp: nombre-componente (sin el .vue)
fullscreen: nombre-componente (sin el .vue)
mostrar: si/no (si la propiedad no existe se considera como "si")
---

FULLSCREEN:   add "fullscreen: componente" to metadata to mount component in fullscreen layout (add imports to fullscreen.vue)
CUSTOM:       add "vuecomp: componente" to metadata to mount a component (add imports in content.vue)
TEXTOS:       add "style: trad" in metadata to remove the softbreaks rule from that specific note and set left alignment
JUEGOS:       just use "type: game" and use the custom vuecomp prop to mount the game in content.vue

- S6 & S7TEXT are centered text classes which are affected by the container query
- S6TRAD & S7TEXT-TRAD are the left aligned, normal page, fixed rem size text classes
- S7 is the class for the asset block in design notes that disables line breaks

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
  } catch (e) { console.warn('error limpiando carpetas huérfanas:', e) }

  for (const key of Object.keys(cache)) { const isPostActive = postDirs.some(p => key.startsWith(`${p.typeDir}/${p.slug}/`)); if (!isPostActive) delete cache[key] }

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

    const mdEnPath = path.join(postFolder, 'ingles.md')
    let rawEn = null
    try { rawEn = await fs.readFile(mdEnPath, 'utf-8') } catch { /* no existe, ignorar */ }
    const isBilingual = !!rawEn

    const { attributes, body } = fm(raw)
    const enAttributes = isBilingual ? fm(rawEn).attributes : {}
    const showNote = attributes.mostrar !== 'no' && attributes.mostrar !== false
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
    const canonicalUrlEn = `${webURL}/posts/${postType}/${slug}/ingles.html`

    const hreflangTags = isBilingual ? `
      <link rel="alternate" hreflang="es" href="${canonicalUrl}">
      <link rel="alternate" hreflang="en" href="${canonicalUrlEn}">
      <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
    `.trim() : ''

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
      "publisher": { "@type": "Organization", "name": "octantes.ar", "logo": { "@type": "ImageObject", "@id": `${webURL}/assets/logo.webp`, "url": `${webURL}/assets/logo.webp` } },
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

    const enDesc = (isBilingual && enAttributes.description) || 'short note description'
    const articleJsonEn = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrlEn },
      "headline": attributes.title || slug,
      "image": portadaUrl || `${webURL}/assets/portada.webp`,
      "author": { "@type": "Person", "name": primaryHandle, "url": primaryHandle ? `https://x.com/${primaryHandle}` : `${webURL}/about` },
      "publisher": { "@type": "Organization", "name": "octantes.ar", "logo": { "@type": "ImageObject", "@id": `${webURL}/assets/logo.webp`, "url": `${webURL}/assets/logo.webp` } },
      "datePublished": isoDate,
      "dateModified": isoDate,
      "description": enDesc,
      "keywords": (attributes.tags || []).join(', ')
    });
    const finalArticleJsonEn = articleJsonEn
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

      let fullHtml = template
        .replace(/{{langTag}}/g, 'es')
        .replace(/{{title}}/g, attributes.title || slug)
        .replace(/{{description}}/g, attributes.description || '')
        .replace(/{{portada}}/g, portadaUrl)
        .replace(/{{canonicalUrl}}/g, canonicalUrl)
        .replace(/{{hreflangTags}}/g, hreflangTags)
        .replace(/{{handle}}/g, primaryHandle)
        .replace(/{{date}}/g, formatted)
        .replace(/{{articleJson}}/g, finalArticleJson)
        .replace(/{{htmlContent}}/g, htmlContent)
        .replace(/{{webURL}}/g, webURL)
        .replace(/{{sidebarLinks}}/g, sidebarLinks)
        .replace(/{{subtitle}}/g, 'tejiendo hechizos')
        .replace(/{{bio}}/g, 'm\u00fasica, dise\u00f1o, desarrollo y escritura')
        .replace(/{{navArchive}}/g, '[ARCHIVO]')
        .replace(/{{navArchiveHref}}/g, 'archivo.html')
        .replace(/{{navArticles}}/g, 'art\u00edculos')
        .replace(/{{toggleLabel}}/g, '[ENG]')
        .replace(/{{toggleHref}}/g, 'ingles.html?lang=en')

      await fs.writeFile(path.join(noteOutputDir, 'index.html'), fullHtml)

      if (isBilingual) {
        const { attributes: attrEn, body: bodyEn } = fm(rawEn)
        let htmlContentEn = renderType(bodyEn, attrEn).trim()
        htmlContentEn = htmlContentEn.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(tagName, attrs, postType, slug, attributes.portada))

        let fullHtmlEn = template
          .replace(/{{langTag}}/g, 'en')
          .replace(/{{title}}/g, attrEn.title || slug)
          .replace(/{{description}}/g, attrEn.description || '')
          .replace(/{{portada}}/g, portadaUrl)
          .replace(/{{canonicalUrl}}/g, canonicalUrlEn)
          .replace(/{{hreflangTags}}/g, hreflangTags)
          .replace(/{{handle}}/g, primaryHandle)
          .replace(/{{date}}/g, formatted)
          .replace(/{{htmlContent}}/g, htmlContentEn)
          .replace(/{{webURL}}/g, webURL)
          .replace(/{{sidebarLinks}}/g, sidebarLinks)
          .replace(/{{articleJson}}/g, finalArticleJsonEn)
          .replace(/{{subtitle}}/g, 'weaving spells')
          .replace(/{{bio}}/g, 'music, design, dev &amp; writing')
          .replace(/{{navArchive}}/g, '[ARTICLES]')
          .replace(/{{navArchiveHref}}/g, 'archive.html')
          .replace(/{{navArticles}}/g, 'articles')
          .replace(/{{toggleLabel}}/g, '[ESP]')
          .replace(/{{toggleHref}}/g, 'index.html?lang=es')

        await fs.writeFile(path.join(noteOutputDir, 'ingles.html'), fullHtmlEn)
      }

      cache[`${postType}/${slug}/index.md`] = finalHash

    } else { console.log(`skipping ${slug}/index.md (unchanged)`) }

    if (showNote) {
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
        fullscreen: attributes.fullscreen || null,
        bilingual: isBilingual,
        titleEn: enAttributes.title || null,
        descriptionEn: enAttributes.description || null
      })
    }

  }

}

async function writeIndex() {                                                    // create index.json with processed post metadata 

  await fs.mkdir(outputDir, { recursive: true })
  const indexPath = path.join(outputDir, 'index.json')
  
  indexItems.sort((a,b)=> new Date(b.isoDate) - new Date(a.isoDate))
  const newIndexStr = JSON.stringify(indexItems, null, 2)
  
  let prevIndex = '[]'
  try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch (e) { if (e.code !== 'ENOENT') console.warn('error leyendo index.json previo:', e) }

  if (prevIndex !== newIndexStr) { await fs.writeFile(indexPath, newIndexStr); console.log('index.json updated') }
  else { console.log('skipping index.json (unchanged)') }

}

function generateBilingualSidebar() {                                        // create bilingual sidebar for archive page

  const groups = {}

  indexItems.forEach(item => {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)
  })

  const order = ['musica', 'diseño', 'juegos', 'desarrollo', 'textos']
  Object.keys(groups).forEach(key => { if (!order.includes(key)) order.push(key) })

  const catLabels = { diseño: ['diseño', 'design'], desarrollo: ['desarrollo', 'dev'], musica: ['música', 'music'], textos: ['textos', 'writing'], juegos: ['juegos', 'games'] }

  let html = ''

  order.forEach(type => {
    if (groups[type]) {
      const labels = catLabels[type] || [type, type]
      html += `<li class="cat-header" data-es-text="${esc(labels[0])}" data-en-text="${esc(labels[1])}">${esc(labels[0])}</li>`
      groups[type].sort((a,b) => new Date(b.isoDate) - new Date(a.isoDate)).forEach(p => {
        const esUrl = `${webURL}${p.url}`
        const enUrl = p.bilingual ? `${webURL}${p.url}ingles.html` : esUrl
        const esTitle = p.title
        const enTitle = p.titleEn || p.title
        html += `<li><a href="${esc(esUrl)}" data-es-href="${esc(esUrl)}" data-en-href="${esc(enUrl)}"><span data-es-text="${esc(esTitle)}" data-en-text="${esc(enTitle)}">${esc(esTitle)}</span></a></li>`
      })
    }
  })
  
  return html
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function writeBilingualArchive() {                                   // create bilingual archive page with JS toggle

  const sidebarHTML = generateBilingualSidebar()
  const sortedItems = [...indexItems].sort((a,b)=> new Date(b.isoDate) - new Date(a.isoDate))

  const latestHTML = sortedItems.slice(0, 15).map(i => {
    const esUrl = `${i.url}`
    const enUrl = i.bilingual ? `${i.url}ingles.html` : esUrl
    const esTitle = i.title
    const enTitle = i.titleEn || i.title
    return `<li><a href="${esc(esUrl)}" data-es-href="${esc(esUrl)}" data-en-href="${esc(enUrl)}"><span class="list-span">[${i.date}]</span> <span data-es-text="${esc(esTitle)}" data-en-text="${esc(enTitle)}">${esc(esTitle)}</span></a></li>`
  }).join('\n')

  const pageHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-key="pageTitle">octantes.ar - archive</title>
  <meta name="description" content="archivo plano // octantes.ar" data-key="desc">
  <link rel="canonical" href="https://octantes.github.io/archivo.html">
  <link rel="alternate" hreflang="es" href="https://octantes.github.io/archivo.html">
  <link rel="alternate" hreflang="en" href="https://octantes.github.io/archive.html">
  <link rel="alternate" hreflang="x-default" href="https://octantes.github.io/archivo.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="octantes.ar - archivo" data-key="pageTitle">
  <meta property="og:description" content="archivo plano // octantes.ar" data-key="desc">
  <meta property="og:url" content="https://octantes.github.io/archivo.html">
  <meta property="og:image" content="https://octantes.github.io/assets/portada.webp">
  <meta property="og:site_name" content="octantes.ar">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="octantes.ar - archivo" data-key="pageTitle">
  <meta name="twitter:description" content="archivo plano // octantes.ar" data-key="desc">
  <meta name="twitter:image" content="https://octantes.github.io/assets/portada.webp">
  <meta name="twitter:creator" content="@octantes">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "octantes.ar - archivo",
    "description": "archivo plano // octantes.ar",
    "url": "https://octantes.github.io/archivo.html",
    "author": { "@type": "Person", "name": "kaste" },
    "publisher": { "@type": "Organization", "name": "octantes.ar" }
  }
  <\/script>
  <link rel="stylesheet" href="/assets/neocities.css">
  <script defer src="https://cloud.umami.is/script.js" data-website-id="09728bae-6bcd-4609-a854-f6b016251416"></script>
  <meta name="google-site-verification" content="dLiN5dsyf2dn83nTH9o-9xwHc7YUgZs4dR2ojjJ4OAM" />
  <script>
(function() {
  var L = {
    es: {
      pageTitle: 'octantes.ar - archivo',
      title: 'abriendo portales a universos alternativos',
      desc: 'archivo plano // octantes.ar',
      subtitle: 'tejiendo hechizos',
      instruct: 'seleccion\u00e1 una nota del men\u00fa izquierdo para comenzar la lectura.',
      latest: '\u00faltimas actualizaciones',
      articles: 'art\u00edculos',
      bio: 'm\u00fasica, dise\u00f1o, desarrollo y escritura',
      navArticles: '[ART\u00cdCULOS]',
      navPortal: '[PORTAL]',
      navRss: '[RSS]',
      toggleTo: '[ENG]'
    },
    en: {
      pageTitle: 'octantes.ar - archive',
      title: 'opening portals to alternative universes',
      desc: 'flat archive // octantes.ar',
      subtitle: 'weaving spells',
      instruct: 'select a note from the left menu to start reading.',
      latest: 'latest updates',
      articles: 'articles',
      bio: 'music, design, dev & writing',
      navArticles: '[ARTICLES]',
      navPortal: '[PORTAL]',
      navRss: '[RSS]',
      toggleTo: '[ESP]'
    }
  }
  var lang = localStorage.getItem('lang')
  if (!lang) {
    var nav = (navigator.language || '').toLowerCase().split('-')[0]
    lang = nav === 'es' ? 'es' : 'en'
    localStorage.setItem('lang', lang)
  }
  function applyLang(l) {
    lang = l
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
    document.title = L[l].pageTitle
    document.querySelectorAll('[data-key]').forEach(function(el) {
      if (el.tagName === 'META') { el.content = L[l][el.dataset.key]; return }
      el.textContent = L[l][el.dataset.key]
    })
    document.querySelectorAll('[data-es-text]').forEach(function(el) {
      el.textContent = el.dataset[l + 'Text']
    })
    document.querySelectorAll('[data-es-href]').forEach(function(el) {
      el.href = el.dataset[l + 'Href']
    })
  }
  applyLang(lang)
  window.toggleLang = function() { applyLang(lang === 'es' ? 'en' : 'es') }
})()
  <\/script>
</head>
<body>

  <aside class="static-nav">
    <div class="sidebar-content">
    
      <div class="site-logo">OCTANTES</div>
      <div class="site-subtitle" data-key="subtitle">tejiendo hechizos</div>
      
      <div class="profile-box">
        <a href="https://x.com/octantes" target="_blank" class="profile-link">
          <img src="/assets/kaste.webp" alt="kaste avatar" class="profile-img">
        </a>
        <div class="profile-text">
          <strong>kaste</strong><br>
          <i data-key="bio">m\u00fasica, dise\u00f1o, desarrollo y escritura</i>
        </div>
      </div>
      
      <nav class="nav-links" style="flex-direction:column; align-items:center; gap:4px;">
        <div class="nav-row" style="display:flex; gap:4px;">
          <a href="/archive.html" data-key="navArticles" data-es-href="/archivo.html" data-en-href="/archive.html">[ART\u00cdCULOS]</a>
          <a href="/" data-key="navPortal">[PORTAL]</a>
        </div>
        <div class="nav-row" style="display:flex; gap:4px;">
          <a href="/feed.xml" data-key="navRss">[RSS]</a>
          <button onclick="toggleLang()" data-key="toggleTo" style="background:none; border:1px solid var(--polvo); padding:2px 6px; color:var(--cristal); cursor:pointer; font:inherit; line-height:inherit;">[ENG]</button>
        </div>
      </nav>
      
      <div class="separator-nomargin" data-key="articles">art\u00edculos</div>
      <ul class="article-list">${sidebarHTML}</ul>
      
    </div>
  </aside>
  
  <main class="post-content">
  
    <header class="post-header">
      <h1 data-key="title">abriendo portales a universos alternativos</h1>
      <div class="meta" data-key="desc">archivo plano // octantes.ar</div>
    </header>
    
    <p data-key="instruct">seleccion\u00e1 una nota del men\u00fa izquierdo para comenzar la lectura.</p>
    
    <div class="separator-margin" data-key="latest">\u00faltimas actualizaciones</div>

    <ul class="article-list">
      ${latestHTML}
    </ul>
    
  </main>
  
</body>
</html>`

  await fs.writeFile(path.join(outputDir, 'archivo.html'), pageHtml)
  await fs.writeFile(path.join(outputDir, 'archive.html'), pageHtml)
  console.log('archivo.html / archive.html generated (bilingual)')

}

async function writeBasicIndex() {                                               // create both language archive versions
  await writeBilingualArchive()
}

function generateMonolingualSidebar(lang = 'es') {                          // create static sidebar for post pages

  const groups = {}

  indexItems.forEach(item => {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)
  })

  const order = ['musica', 'diseño', 'juegos', 'desarrollo', 'textos']
  Object.keys(groups).forEach(key => { if (!order.includes(key)) order.push(key) })

  const catDict = lang === 'en' ? { diseño: 'design', desarrollo: 'dev', musica: 'music', textos: 'writing', juegos: 'games' } : {}

  let html = ''

  order.forEach(type => {
    if (groups[type]) {
      const typeLabel = catDict[type] || type
      html += `<li class="cat-header">${esc(typeLabel)}</li>`
      groups[type].sort((a,b) => new Date(b.isoDate) - new Date(a.isoDate)).forEach(p => {
        const fileTarget = (lang === 'en' && p.bilingual) ? 'ingles.html' : ''
        const title = lang === 'en' ? (p.titleEn || p.title) : p.title
        html += `<li><a href="${webURL}${p.url}${fileTarget}">${esc(title)}</a></li>`
      })
    }
  })
  
  return html
}

async function updateSidebars() {                                                // update old archive website sidebars 

  const sidebarES = generateMonolingualSidebar('es')
  const sidebarEN = generateMonolingualSidebar('en')
  
  for (const item of indexItems) {

    const basePath = path.join(outputDir, 'posts', item.type, item.slug)

    try {

      let html = await fs.readFile(path.join(basePath, 'index.html'), 'utf-8')
      html = html.replace(/<ul class="article-list">[\s\S]*?<\/ul>/, `<ul class="article-list">${sidebarES}</ul>`)
      await fs.writeFile(path.join(basePath, 'index.html'), html)

      if (item.bilingual) {
        let htmlEn = await fs.readFile(path.join(basePath, 'ingles.html'), 'utf-8')
        htmlEn = htmlEn.replace(/<ul class="article-list">[\s\S]*?<\/ul>/, `<ul class="article-list">${sidebarEN}</ul>`)
        await fs.writeFile(path.join(basePath, 'ingles.html'), htmlEn)
      }

    } catch (e) { console.error(`Error updating sidebar for ${item.slug}`, e) }

  }

  console.log('sidebars updated globally')

}

async function writeSitemap() {                                                  // create sitemap and robots.txt 

  const staticPages = [
    { url: '/', lastmod: new Date().toISOString() },
    { url: '/archivo.html', lastmod: new Date().toISOString() }
  ]

  const postPages = indexItems.map( post => ({ url: `/${post.type}/${post.slug}/`, lastmod: post.isoDate }) )
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
  const feedTitle = 'octantes.ar'
  const feedUrl = `${webURL}/feed.xml`
  const feedDescription = 'a multimedia web portal, no algorithms or middlemen'

  const channelItems = indexItems.map(post => {
    const postUrl = `${webURL}${post.url}`
    const postDate = new Date(post.isoDate).toUTCString()
    const escapedDescription = post.description
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    const escapedTitle = post.title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `<item>
      <title>${escapedTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${postDate}</pubDate>
      <description>${escapedDescription}</description>
      <author>kaste@octantes.ar (kaste)</author>
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
  try { prevFeed = await fs.readFile(feedPath, 'utf-8') } catch (e) { if (e.code !== 'ENOENT') console.warn('error leyendo feed.xml previo:', e) }

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

  await fs.writeFile(path.join(outputDir, '.nojekyll'), '')
  console.log('.nojekyll created')

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