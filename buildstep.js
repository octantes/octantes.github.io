import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sharp from 'sharp'
import { SITE_URL, TAGLINE, SITE_DESCRIPTION, SECTIONS, ARCHIVE_VIEW, AUTHOR_NAME, MAIN_PROJECTS, GIF_AS_VIDEO, GIF_ENCODE } from './src/04/site-config.js'
import { DICT } from './src/04/dict.js'
import { SHARE_SIZE, ARCHIVE_FLAG, headFor, renderHead, pathOf, urlOf, labelOf } from './src/04/pages.js'
import { figlet } from './src/04/figlet.js'

// IMAGES  | .jpg .jpeg .png      | sharp processing     | .webp       | <img width="..." height="..." loading="lazy">
// AUDIOS  | .mp3 .wav            | ffmpeg processing    | .ogg (opus) | <audio controls preload="auto">
// EMBED   |  yt or spotify url   | reduced embed iframe |  unchanged  | <div> <iframe>
// VIDEOS  | .mov .mp4 .avi .webm | direct copy          |  unchanged  | <video muted loop playsinline preload="auto" class="videosync">
// GIFS    | .gif                 | h264 transcode       | .mp4        | <video class="gifvideo" autoplay muted loop playsinline>  (GIF_AS_VIDEO)
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
mostrar: si/no (si la propiedad no existe se considera como "si")
---

CUSTOM:       add "vuecomp: componente" to metadata to mount a component (add imports in content.vue)
TEXTOS:       add "style: trad" in metadata to remove the softbreaks rule from that specific note and set left alignment
JUEGOS:       just use "type: game" and use the custom vuecomp prop to mount the game in content.vue

- .nota & .nota-verso are centered text classes which are affected by the container query
- .nota-prosa is the left aligned, normal page, fixed rem size text class

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

const cacheFile = path.resolve(process.env.BUILD_CACHE || '.build-cache.json')
const template = await fs.readFile('./templates/post.html', 'utf-8')
const webURL = SITE_URL

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

      const noteBlockClass = isTrad ? 'nota nota-prosa' : 'nota nota-verso'

      return `${renderedAssets}${ noteBlock ? `<div class="${noteBlockClass}">${md.render(noteBlock)}</div>` : ''}`

    }

    default: {

        if (isTrad) { return `<div class="nota-prosa">${md.render(body)}</div>` }
        return md.render(body) 

    }

  }

}

function processAssets(tag, attrs, type, slug, portada) {                                            // replace asset src for optimized HTML tag 

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

  const size = mediaSizes.get(filename)
  const sized = size ? ` width="${size.width}" height="${size.height}"` : ''
  const poster = mediaPosters.has(filename) ? ` poster="/posts/${type}/${slug}/${mediaPosters.get(filename)}"${sized}` : ''

  if (isImage) {

    let dimensions = { width: 600, height: 400 }
    if (filename === portada) dimensions = { width: 1200, height: 630 }
    if (size) dimensions.height = Math.round(dimensions.width * size.height / size.width)
    filename = filename.replace(/\.(jpe?g|png)$/i, '.webp') 
    const absUrl = `/posts/${type}/${slug}/${filename}`
    return `<img src="${absUrl}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}">`

  } else if (isGif) {

    if (GIF_AS_VIDEO) {
      const absUrl = `/posts/${type}/${slug}/${filename.replace(/\.gif$/i, '.mp4')}`
      return `<video src="${absUrl}"${poster} class="gifvideo" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-label="${altText}"></video>`
    }

    const absUrl = `/posts/${type}/${slug}/${filename}`
    return `<img src="${absUrl}"${sized} loading="lazy" alt="${altText}">`

  } else if (isVideo) {
    
    const absUrl = `/posts/${type}/${slug}/${filename}`
    if (silentVideos.has(filename)) {
      return `<video src="${absUrl}"${poster} class="gifvideo" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-label="${altText}"></video>`
    }
    return `<video src="${absUrl}" muted loop playsinline preload="auto" class="videosync" aria-label="${altText}"></video>`

  } else if (isAudio) {

    filename = filename.replace(/\.(mp3|wav)$/i, '.ogg')
    const absUrl = `/posts/${type}/${slug}/${filename}`
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

async function fresh(inputPath, outputPath) {

  try { return (await fs.stat(outputPath)).mtimeMs >= (await fs.stat(inputPath)).mtimeMs }
  catch { return false }

}

async function makeShare(inputPath, destPath) {

  if (await fresh(inputPath, destPath)) return
  await sharp(inputPath).resize(SHARE_SIZE.width, SHARE_SIZE.height, { fit: 'cover' }).flatten({ background: '#1B1C1C' }).jpeg({ quality: 82, mozjpeg: true }).toFile(destPath)

}

async function convertImage(inputPath, destPath, width = 1200, quality = 80) {   // convert input image files to WEBP 

  try {

    const finalOutputPath = destPath.replace(/\.(jpe?g|png)$/i, '.webp')
    if (await fresh(inputPath, finalOutputPath)) return finalOutputPath
    await sharp(inputPath).resize({ width: width, withoutEnlargement: true }).webp({ quality: quality }).toFile(finalOutputPath)
    return finalOutputPath

  } catch(e) { throw new Error(`error processing image ${inputPath}: ${e.message}`) }

}

async function convertAudio(inputPath, destPath) {                               // convert input audio files to OGG 

  const finalOutputPath = destPath.replace(/\.(mp3|wav)$/i, '.ogg')
  if (await fresh(inputPath, finalOutputPath)) return finalOutputPath

  return new Promise((resolve, reject) => {
    
    const args = [ '-i', inputPath, '-c:a', 'libopus', '-b:a', '96k', '-y', finalOutputPath ]
    const ffmpegProcess = spawn('ffmpeg', args)

    ffmpegProcess.on('close', (code) => { if (code === 0) { resolve(finalOutputPath) } else { reject(new Error(`FFMPEG audio conversion failed with code ${code} for ${inputPath}`)) } })
    ffmpegProcess.on('error', (err) => { reject(new Error(`Failed to start FFMPEG process for audio: ${err.message}`)) })

  })

}

async function convertVideo(inputPath, destPath) {                               // just copies video files to output 

  try {

    const finalOutputPath = destPath
    if (await fresh(inputPath, finalOutputPath)) return finalOutputPath
    const data = await fs.readFile(inputPath)
    await fs.writeFile(finalOutputPath, data)
    return finalOutputPath

  } catch(e) { throw new Error(`error copying video ${inputPath}: ${e.message}`) }

}

const silentVideos = new Set()
const mediaSizes = new Map()
const mediaPosters = new Map()

async function makePoster(videoPath) {

  const posterPath = videoPath.replace(/\.[^.]+$/, '-poster.jpg')
  if (!(await fresh(videoPath, posterPath))) {
    await new Promise(resolve => {
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-i', videoPath, '-frames:v', '1', '-q:v', '3', posterPath])
      ff.on('error', resolve)
      ff.on('close', resolve)
    })
  }
  return fs.access(posterPath).then(() => path.basename(posterPath), () => null)

}

async function isSilent(inputPath) {

  return new Promise(resolve => {
    const ff = spawn('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', inputPath])
    let out = ''
    ff.stdout.on('data', d => { out += d })
    ff.on('error', () => resolve(false))
    ff.on('close', () => resolve(out.trim() === ''))
  })

}

async function convertGif(inputPath, destPath) {

  try {

    if (!GIF_AS_VIDEO) {

      if (await fresh(inputPath, destPath)) return destPath
      const data = await fs.readFile(inputPath)
      await fs.writeFile(destPath, data)
      return destPath

    }

    const finalOutputPath = destPath.replace(/\.gif$/i, '.mp4')
    if (await fresh(inputPath, finalOutputPath)) return finalOutputPath

    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-i', inputPath,
        '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264', '-crf', GIF_ENCODE.crf, '-preset', GIF_ENCODE.preset, '-movflags', '+faststart',
        '-an', finalOutputPath])
      let err = ''
      ff.stderr.on('data', d => { err += d })
      ff.on('error', reject)
      ff.on('close', code => code === 0 ? resolve() : reject(new Error(err.trim() || `ffmpeg exited ${code}`)))
    })

    return finalOutputPath

  } catch(e) { throw new Error(`error converting gif ${inputPath}: ${e.message}`) }

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
        if (/^portada\.(jpe?g|png)$/i.test(asset)) await makeShare(assetPath, path.join(assetsDest, 'share.jpg'))

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

  for (const word of new Set(SECTIONS.flatMap(s => [s.es, s.en]))) {
    let children = []
    try { children = await fs.readdir(path.join(outputDir, word), { withFileTypes: true }) } catch { continue }
    for (const child of children) if (child.name !== 'index.html' && !postDirs.some(p => `${p.slug}.html` === child.name)) await fs.rm(path.join(outputDir, word, child.name), { recursive: true, force: true })
  }

  for (const key of Object.keys(cache)) { const isPostActive = postDirs.some(p => key.startsWith(`${p.typeDir}/${p.slug}/`)); if (!isPostActive) delete cache[key] }

}

const chrome = {
  es: { bio: 'm\u00fasica, dise\u00f1o, desarrollo y escritura', navArchive: '[ARCHIVO]', navPosts: 'posteos', toggleLabel: '[ENG]', archiveMeta: 'archivo plano // octantes.ar' },
  en: { bio: 'music, design, dev &amp; writing', navArchive: '[ARTICLES]', navPosts: 'posts', toggleLabel: '[ESP]', archiveMeta: 'flat archive // octantes.ar' },
}

const otherLang = lang => lang === 'es' ? 'en' : 'es'

let shell = null
const writtenPages = []

function pageFile(page, lang) {

  const file = path.join(outputDir, ...pathOf(page, lang).split('/').filter(Boolean))
  return page.kind === 'section' ? path.join(file, 'index.html') : file.endsWith('.html') ? file : file + '.html'

}

function archiveHref(page, lang) { return page.kind === 'archive' ? pathOf(page, lang) : `${pathOf(page, lang)}?${ARCHIVE_VIEW[lang]}` }

function markCurrent(html, href) { return html.replace(`<a href="${href}"`, () => `<a href="${href}" aria-current="page"`) }

function noteHref(p, lang) { return archiveHref({ kind: 'note', id: p.type, slug: p.slug }, lang === 'en' && p.bilingual ? 'en' : 'es') }

function noteTitle(p, lang) { return lang === 'en' && p.titleEn || p.title }

async function readShell() {

  try {
    const html = await fs.readFile(path.join(outputDir, 'index.html'), 'utf-8')
    const home = renderHead(headFor({ kind: 'home' }, 'es'))
    if (!html.includes(home)) return null
    const top = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>')).replace(home, '').replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '').replace(/\n\s*\n\s*\n/g, '\n\n').trim()
    return { html, home, top }
  } catch { return null }

}

function composeHead(page, lang, item) {

  const bare = '<meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">'
  const archiveCss = '<link rel="stylesheet" href="/assets/neocities.css">'
  const unwrapped = '<style>noscript.archive { display: contents }</style>'
  const head = renderHead(headFor(page, lang, item))

  if (page.kind === 'archive') {
    const top = shell ? shell.top.split('\n').filter(line => !/type="module"|modulepreload|rel="stylesheet"|rel="preload"/.test(line)).join('\n').replace(/\n\s*\n\s*\n/g, '\n\n') : bare
    return [top, archiveCss, `<noscript>${unwrapped}</noscript>`, `<script>document.documentElement.classList.add('archive')</script>`, head].join('\n\n    ')
  }

  const app = shell ? shell.top.replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet" media="(scripting: enabled)" crossorigin') : bare
  const view = `<script>(function () { var archive = location.search.match(${ARCHIVE_FLAG}); document.querySelectorAll('link[rel=stylesheet]').forEach(function (l) { if (archive) l.disabled = true; else l.media = 'all' }); if (archive) { document.documentElement.classList.add('archive'); document.documentElement.dataset.view = archive[1]; document.write('${archiveCss}') } })()</script>`
  const note = page.kind === 'note' ? `<script type="application/json" id="note">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>` : ''
  return [app, `<noscript>${archiveCss}${unwrapped}</noscript>`, view, head, note].filter(Boolean).join('\n\n    ')

}

function fillTemplate({ page, lang, item, title, meta, type, toggleHref, sidebar = '', content }) {

  const chromed = template
    .replace(/\s*<header class="post-header">[\s\S]*?<\/header>/, header => title ? header : '')
    .replace(/{{head}}/g, () => composeHead(page, lang, item))
    .replace(/{{langTag}}/g, lang)
    .replace(/{{title}}/g, () => title)
    .replace(/{{meta}}/g, () => meta)
    .replace(/{{sidebarLinks}}/g, () => sidebar)
    .replace(/{{subtitle}}/g, TAGLINE[lang])
    .replace(/{{bio}}/g, chrome[lang].bio)
    .replace(/{{postType}}/g, type)
    .replace(/{{navArchive}}/g, chrome[lang].navArchive)
    .replace(/{{navArchiveHref}}/g, archiveHref({ kind: 'archive' }, lang))
    .replace(/{{navPosts}}/g, chrome[lang].navPosts)
    .replace(/{{aboutHref}}/g, archiveHref({ kind: 'about' }, lang))
    .replace(/{{toggleLabel}}/g, chrome[lang].toggleLabel)
    .replace(/{{toggleHref}}/g, toggleHref)
    .replace(/{{portfolioHref}}/g, archiveHref({ kind: 'portfolio' }, lang))

  return markCurrent(chromed, archiveHref(page, lang)).replace(/{{htmlContent}}/g, () => content)

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

    await fs.mkdir(noteOutputDir, { recursive: true })

    const hash = crypto.createHash('sha256').update(raw)
    if (rawEn) hash.update(rawEn)

    try {

      const assets = await fs.readdir(postFolder, { withFileTypes: true })
      silentVideos.clear()
      mediaSizes.clear()
      mediaPosters.clear()

      for (const asset of assets) {

        if (!asset.isFile() || asset.name === 'index.md' || asset.name === 'ingles.md') continue

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

          const quiet = await isSilent(assetPath)
          if (quiet) silentVideos.add(asset.name)
          console.log(quiet ? `copying silent video ${asset.name} (treated as a gif)...` : `copying video ${asset.name} without processing...`)
          finalOutputPath = await convertVideo(assetPath, destPath)

        } else if (isGif) {

          console.log(GIF_AS_VIDEO ? `converting gif ${asset.name} to MP4...` : `copying gif ${asset.name} without processing...`)
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

        const poster = (isGif && GIF_AS_VIDEO) || silentVideos.has(asset.name) ? await makePoster(finalOutputPath) : null
        if (poster) mediaPosters.set(asset.name, poster)
        const size = isImage || (isGif && !GIF_AS_VIDEO) ? await sharp(finalOutputPath).metadata().catch(() => null) : poster ? await sharp(path.join(noteOutputDir, poster)).metadata().catch(() => null) : null
        if (size?.width && size?.height) mediaSizes.set(asset.name, { width: size.width, height: size.height })

        const finalData = await fs.readFile(finalOutputPath)
        hash.update(finalData)

      }

    } catch(e) { console.error(`error processing assets for ${slug}:`, e) }

    const finalHash = hash.digest('hex')
    const dateObj = attributes.date ? new Date(attributes.date) : new Date()
    const formatted = `${String(dateObj.getUTCDate()).padStart(2,'0')}/${String(dateObj.getUTCMonth()+1).padStart(2,'0')}/${dateObj.getUTCFullYear()}`
    const isoDate = attributes.date ? new Date(attributes.date).toISOString() : dateObj.toISOString()
    const modifiedDate = attributes.modified ? new Date(attributes.modified).toISOString() : isoDate
    const rawPortada = attributes.portada ? attributes.portada.replace(/\[\[|\]\]/g, '') : ''
    const portadaUrl = rawPortada ? `${webURL}/posts/${postType}/${slug}/${rawPortada.replace(/\.(jpe?g|png)$/i, '.webp')}` : ''

    const rawHandle = attributes.handle
    const handles = (Array.isArray(rawHandle) ? rawHandle : (rawHandle ? [rawHandle] : ['kaste'])).map(h => String(h).replace(/^@/, ''))
    const primaryHandle = handles[0] // only one handle in html for SEO

    if (rawPortada) await makeShare(path.join(postFolder, rawPortada), path.join(noteOutputDir, 'share.jpg'))

    const item = {
      slug,
      title: attributes.title || slug,
      description: attributes.description || '',
      type: postType || 'textos',
      tags: attributes.tags || [],
      portada: portadaUrl,
      share: rawPortada ? `${webURL}/posts/${postType}/${slug}/share.jpg` : null,
      handle: handles,
      date: formatted,
      isoDate: isoDate,
      modified: modifiedDate,
      vuecomp: attributes.vuecomp || null,
      bilingual: isBilingual,
      titleEn: enAttributes.title || null,
      descriptionEn: enAttributes.description || null
    }

    const page = { kind: 'note', id: postType, slug }
    const written = await Promise.all(['es', 'en'].map(lang => fs.access(pageFile(page, lang)).then(() => true, () => false)))

    if (fullRebuild || written.includes(false) || cache[`${postType}/${slug}/index.md`] !== finalHash) {

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

      const toggleHref = lang => isBilingual ? archiveHref(page, otherLang(lang)) : archiveHref({ kind: 'archive' }, 'en')
      const fill = (lang, title, content) => fillTemplate({ page, lang, item, title, meta: `${formatted} // ${primaryHandle}`, type: postType, toggleHref: toggleHref(lang), content })

      const pageEs = fill('es', attributes.title || slug, htmlContent)
      let pageEn = pageEs

      if (isBilingual) {
        const { attributes: attrEn, body: bodyEn } = fm(rawEn)
        let htmlContentEn = renderType(bodyEn, attrEn).trim()
        htmlContentEn = htmlContentEn.replace(/<(img|video)\s+([^>]+?)(\/?>)/gi, (match, tagName, attrs, endTag) => processAssets(tagName, attrs, postType, slug, attributes.portada))
        pageEn = fill('en', attrEn.title || slug, htmlContentEn)
      }

      for (const [lang, html] of [['es', pageEs], ['en', pageEn]]) {
        await fs.mkdir(path.dirname(pageFile(page, lang)), { recursive: true })
        await fs.writeFile(pageFile(page, lang), html)
      }

      cache[`${postType}/${slug}/index.md`] = finalHash

    } else { console.log(`skipping ${slug}/index.md (unchanged)`) }

    writtenPages.push({ page, file: pageFile(page, 'es'), lang: 'es' }, { page, file: pageFile(page, 'en'), lang: isBilingual ? 'en' : 'es' })

    if (showNote) indexItems.push(item)

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

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function projectList(items, shape = '') { return `<ul class="article-list project-list${shape}">${items.join('')}</ul>` }

function noteItem(p, lang) { return `<li><a href="${noteHref(p, lang)}">${esc(noteTitle(p, lang))}</a>${esc(lang === 'en' && p.descriptionEn || p.description)}<br><br></li>` }

function latestList(lang) {

  const latest = [...indexItems].sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate)).slice(0, 15)
  return `<ul class="article-list">${latest.map(p => `<li><a href="${noteHref(p, lang)}"><span class="list-span">[${p.date}]</span> ${esc(noteTitle(p, lang))}</a></li>`).join('')}</ul>`

}

function withEnglish(es, en) {

  const open = '<noscript class="archive">', close = '</noscript>'
  const english = `<template data-view="${ARCHIVE_VIEW.en}" lang="en">${en.slice(en.indexOf(open) + open.length, en.lastIndexOf(close))}</template>`
  const end = es.lastIndexOf(close) + close.length
  return `${es.slice(0, end)}\n\n    ${english}${es.slice(end)}`

}

async function writePortfolio() {

  const page = { kind: 'portfolio' }
  const tones = { 'dise\u00f1o': 'lirio', desarrollo: 'cristal' }

  const content = lang => [
    `<p>${DICT[lang].portfolio.desc}</p>`,
    `<section class="projects cristal">${projectList(MAIN_PROJECTS.map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>: ${esc(p.desc[lang])}</li>`), ' project-row')}</section>`,
    ...Object.entries(tones).map(([id, tone]) => `<section class="projects ${tone}"><h2>${esc(labelOf(id, lang))}</h2>\n` +
      projectList(indexItems.filter(p => p.type === id).map(p => noteItem(p, lang))) + '</section>'),
  ].join('\n')

  const fill = lang => fillTemplate({
    page, lang, title: AUTHOR_NAME.toLowerCase(), meta: DICT[lang].portfolio.subtitle.toLowerCase(), type: 'portfolio',
    toggleHref: archiveHref(page, otherLang(lang)), sidebar: generateMonolingualSidebar(lang), content: content(lang),
  })

  await fs.writeFile(pageFile(page, 'es'), withEnglish(fill('es'), fill('en')))

}

async function writeShells() {

  if (!shell) { console.warn('no built index.html, skipping page shells'); return }

  const pages = [
    ...['es', 'en'].map(lang => [{ kind: 'about' }, lang]),
    ...SECTIONS.filter(s => s.id !== 'portal').flatMap(s => ['es', 'en'].map(lang => [{ kind: 'section', id: s.id }, lang])),
    [{ kind: 'portal' }, 'es'],
  ]

  for (const [page, lang] of pages) {
    const html = page.kind === 'portal' ? shell.html.replace('<html lang="es">', `<html lang="${lang}">`).replace(shell.home, () => renderHead(headFor(page, lang))) : aboutPage(page, lang)
    await fs.mkdir(path.dirname(pageFile(page, lang)), { recursive: true })
    await fs.writeFile(pageFile(page, lang), html)
    if (page.kind === 'section') await fs.writeFile(path.join(outputDir, pathOf(page, lang).slice(1) + '.html'), html)
  }

  console.log(`${pages.length} page shells written`)

}

function aboutPage(page, lang) {

  const id = page.id ?? 'portal'
  const about = DICT[lang].about
  const content = [`<p>${about.sections[id]}</p>`, '<hr>', `<p>${about.footers[id]}</p>`].join('\n')

  return fillTemplate({
    page, lang, title: headFor(page, lang).name, meta: chrome[lang].archiveMeta, type: page.kind,
    toggleHref: archiveHref(page, otherLang(lang)), sidebar: generateMonolingualSidebar(lang), content,
  })

}

async function writeArchive() {                                                  // create both language archive versions

  const intro = {
    es: { title: 'abriendo portales a universos alternativos', instruct: 'seleccion\u00e1 una nota del men\u00fa izquierdo para comenzar la lectura.', latest: '\u00faltimas actualizaciones' },
    en: { title: 'opening portals to alternative universes', instruct: 'select a note from the left menu to start reading.', latest: 'latest updates' },
  }

  const page = { kind: 'archive' }

  for (const lang of ['es', 'en']) {
    const content = [`<p>${intro[lang].instruct}</p>`, `<div class="separator-margin">${intro[lang].latest}</div>`, latestList(lang)].join('\n')
    await fs.writeFile(pageFile(page, lang), fillTemplate({
      page, lang, title: intro[lang].title, meta: chrome[lang].archiveMeta, type: 'archive',
      toggleHref: archiveHref(page, otherLang(lang)), sidebar: generateMonolingualSidebar(lang), content,
    }))
  }

  console.log('archivo.html / archive.html generated')

}

function generateMonolingualSidebar(lang = 'es') {                          // create static sidebar for post pages

  const groups = {}

  indexItems.forEach(item => {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)
  })

  const order = ['musica', 'diseño', 'juegos', 'desarrollo', 'textos']
  Object.keys(groups).forEach(key => { if (!order.includes(key)) order.push(key) })


  let html = ''

  order.forEach(type => {
    if (groups[type]) {
      const typeLabel = labelOf(type, lang)
      html += `<li class="cat-header"><a href="${archiveHref({ kind: 'section', id: type }, lang)}">${esc(typeLabel)}</a></li>`
      groups[type].sort((a,b) => new Date(b.isoDate) - new Date(a.isoDate)).forEach(p => {
        html += `<li><a href="${noteHref(p, lang)}">${esc(noteTitle(p, lang))}</a></li>`
      })
    }
  })
  
  return html
}

async function updateSidebars() {                                                // update old archive website sidebars 

  const sidebars = { es: generateMonolingualSidebar('es'), en: generateMonolingualSidebar('en') }

  for (const { page, file, lang } of writtenPages) {

    try {

      const html = await fs.readFile(file, 'utf-8')
      await fs.writeFile(file, html.replace(/<ul class="article-list">[\s\S]*?<\/ul>/, () => `<ul class="article-list">${markCurrent(sidebars[lang], archiveHref(page, lang))}</ul>`))

    } catch (e) { console.error(`Error updating sidebar for ${file}`, e) }

  }

  console.log('sidebars updated globally')

}

async function writeSitemap() {                                                  // create sitemap and robots.txt 

  const newest = items => items.reduce((a, p) => (p.modified || p.isoDate) > a ? (p.modified || p.isoDate) : a, '')
  const latest = newest(indexItems)
  const paired = (page, lastmod) => ['es', 'en'].map(lang => ({ url: urlOf(page, lang), lastmod, alternates: { es: urlOf(page, 'es'), en: urlOf(page, 'en'), 'x-default': urlOf(page, 'es') } }))

  const entries = [
    { url: urlOf({ kind: 'home' }), lastmod: latest },
    ...SECTIONS.filter(s => s.id !== 'portal').flatMap(s => paired({ kind: 'section', id: s.id }, newest(indexItems.filter(p => p.type === s.id)) || latest)),
    ...paired({ kind: 'about' }, latest),
    { url: urlOf({ kind: 'portfolio' }), lastmod: latest },
    ...indexItems.flatMap(p => {
      const page = { kind: 'note', id: p.type, slug: p.slug }
      return p.bilingual ? paired(page, p.modified || p.isoDate) : [{ url: urlOf(page, 'es'), lastmod: p.modified || p.isoDate }]
    }),
    ...['archivo.html', 'archive.html'].map(file => ({ url: `${webURL}/${file}`, lastmod: latest, alternates: { es: `${webURL}/archivo.html`, en: `${webURL}/archive.html`, 'x-default': `${webURL}/archivo.html` } })),
  ]

  const loc = url => encodeURI(url).replace(/&/g, '&amp;')
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(e => [
      '  <url>',
      `    <loc>${loc(e.url)}</loc>`,
      ...Object.entries(e.alternates || {}).map(([code, href]) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${loc(href)}"/>`),
      `    <lastmod>${e.lastmod}</lastmod>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
    '',
  ].join('\n')

  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap)
  console.log('sitemap.xml updated')

  await fs.writeFile(path.join(outputDir, 'robots.txt'), `User-agent: *\nDisallow:\n\nSitemap: ${webURL}/sitemap.xml\n`)
  console.log('robots.txt generated')

}

async function writeFeed() {                                                     // create RSS feed XML 

  await fs.mkdir(outputDir, { recursive: true })
  const feedPath = path.join(outputDir, 'feed.xml')
  
  const now = new Date().toUTCString()
  const feedTitle = 'octantes.ar'
  const feedUrl = `${webURL}/feed.xml`
  const feedDescription = `${TAGLINE.en} - ${SITE_DESCRIPTION.en}`

  const channelItems = indexItems.map(post => {
    const postUrl = encodeURI(urlOf({ kind: 'note', id: post.type, slug: post.slug }, post.bilingual ? 'en' : 'es'))
    const postDate = new Date(post.isoDate).toUTCString()
    const rssTitle = post.titleEn || post.title
    const rssDesc = post.titleEn ? (post.descriptionEn || post.description) : post.description
    const escapedTitle = rssTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    const escapedDescription = rssDesc
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
    <link>${webURL}/</link>
    <description>${feedDescription}</description>
    <language>en</language>
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

async function finalizeBuild() {                                                 // update cache and create 404 

  await fs.mkdir(path.dirname(cacheFile), { recursive: true })
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

  const page = { kind: 'notfound', path: '' }
  const fill = lang => {
    const copy = DICT[lang].notFound
    const content = `<pre class="errorart">${figlet(404)}</pre>\n<p>${copy.byCode['404']}</p>\n<nav class="nav-links"><a href="${archiveHref({ kind: 'archive' }, lang)}">[${copy.back}]</a></nav>`
    return fillTemplate({ page, lang, title: '', meta: '', type: 'notfound', toggleHref: archiveHref(page, otherLang(lang)), sidebar: generateMonolingualSidebar(lang), content })
  }
  await fs.writeFile(path.join(outputDir, '404.html'), withEnglish(fill('es'), fill('en')))
  console.log('404.html generated')

  await fs.writeFile(path.join(outputDir, '.nojekyll'), '')
  console.log('.nojekyll created')
  
  try {
    await fs.writeFile(path.resolve('docs', '.nojekyll'), '')
    console.log('.nojekyll created in docs/')
  } catch (e) { console.warn('could not write .nojekyll to docs/:', e.message) }

}

async function main() {                                                          // main build process 

  await setupBuild()
  shell = await readShell()
  await copyAssets()
  await cleanOrphans()
  await processPosts()
  await writeIndex()
  await writePortfolio()
  await updateSidebars()
  await writeArchive()
  await writeShells()
  await writeSitemap()
  await writeFeed()
  await finalizeBuild()

  console.log('build completed successfully: static notes, index, SEO files, and cache updated.')

}

main().catch(err => { console.error('BUILD FAILED:', err); process.exit(1) })