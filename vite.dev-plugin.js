import { readFile, readdir, stat } from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const defaultSoftbreak = md.renderer.rules.softbreak

const customSoftbreak = (tokens, idx, options, env, self) => {

    const token = tokens[idx]

    if (token.level % 2 === 1) { return '<br />' }

    const prev = tokens[idx - 1]
    const next = tokens[idx + 1]

    const isAsset = (t) => t && t.type === 'inline' && (t.children.some(c => c.type === 'image') || t.content.match(/<iframe|<img/i))

    if (isAsset(prev) || isAsset(next)) { return '' }

    return '<br />'

}

md.renderer.rules.softbreak = customSoftbreak

const contentDir = './content'

function renderMarkdown(body, attributes, type) { 

  const isTrad = attributes.style === 'trad'
  
  switch (type) {
    case 'diseño': {
      const parts = body.split('[!TEXT]')
      const assetBlock = parts[0] || ''
      const noteBlock = parts.slice(1).join('[!TEXT]')
      
      const renderedAssets = md.render(assetBlock)
        .replace(/^\s*<p>(.*?)<\/p>\s*$/is, '$1')
        .replace(/<br\s*\/?>/gi, '')
      
      const noteBlockClass = isTrad ? 'S7TEXT-TRAD' : 'S7TEXT'
      
      return `${renderedAssets}${ noteBlock ? `<div class="${noteBlockClass}">${md.render(noteBlock)}</div>` : ''}`
    }
    
    default: {
      if (isTrad) return `<div class="S6TRAD">${md.render(body)}</div>`
      return md.render(body)
    }
  }

}

function processAssets(html, type, slug) { 

  return html.replace(/<(img|video|audio)\s+([^>]+?)>/gi, (match, tag, attrs) => {
    const srcMatch = attrs.match(/src="([^"]+)"/)
    if (!srcMatch) return match
    const src = srcMatch[1]
    if (src.startsWith('http') || src.startsWith('data:')) return match
    const newSrc = `/content/${type}/${slug}/${src}`
    return `<${tag} src="${newSrc}" ${attrs.replace(/src="[^"]+"/, '')}>`
  })
}

async function scanContentDir() { 

  const indexItems = []
  
  try { 
    const typeDirs = await readdir(contentDir, { withFileTypes: true })
    
    for (const tdir of typeDirs) {
      if (!tdir.isDirectory() || tdir.name === 'assets') continue
      
      const postsInTypeDir = await readdir(path.join(contentDir, tdir.name), { withFileTypes: true })
      
      for (const pdir of postsInTypeDir) {
        if (!pdir.isDirectory()) continue
        
        const mdPath = path.join(contentDir, tdir.name, pdir.name, 'index.md')
        
        try {
          const raw = await readFile(mdPath, 'utf-8')
          const { attributes, body } = fm(raw)
          const showNote = attributes.mostrar !== 'no' && attributes.mostrar !== false
          
          if (showNote) {
            const dateObj = attributes.date ? new Date(attributes.date) : new Date()
            const formatted = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`
            
            const rawHandle = attributes.handle
            const handles = Array.isArray(rawHandle) ? rawHandle : (rawHandle ? [rawHandle] : ['kaste'])

            const mdEnPath = path.join(contentDir, tdir.name, pdir.name, 'ingles.md')
            let enAttributes = {}
            try {
              const rawEn = await readFile(mdEnPath, 'utf-8')
              enAttributes = fm(rawEn).attributes
            } catch { /* no ingles.md, not bilingual */ }
            const isBilingual = Object.keys(enAttributes).length > 0
            
            indexItems.push({
              slug: pdir.name,
              title: attributes.title || pdir.name,
              description: attributes.description || '',
              type: attributes.type || tdir.name,
              tags: attributes.tags || [],
              portada: attributes.portada ? `/content/${tdir.name}/${pdir.name}/${attributes.portada}` : '',
              handle: handles,
              date: formatted,
              isoDate: attributes.date || dateObj.toISOString(),
              url: `/posts/${attributes.type || tdir.name}/${pdir.name}/`,
              vuecomp: attributes.vuecomp || null,
              fullscreen: attributes.fullscreen || null,
              bilingual: isBilingual,
              titleEn: enAttributes.title || null,
              descriptionEn: enAttributes.description || null
            })
          }
        } catch (e) {
          console.warn(`skipping ${tdir.name}/${pdir.name}: ${e.message}`)
        }
      }
    }
  } catch (e) { console.error('error scanning content dir:', e.message) }
  
  return indexItems.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))

}

async function renderNote(type, slug, lang = 'es') { 
  
  const mdPath = path.join(contentDir, type, slug, lang === 'en' ? 'ingles.md' : 'index.md')
  
  try {
    const raw = await readFile(mdPath, 'utf-8')
    const { attributes, body } = fm(raw)
    
    let htmlContent = renderMarkdown(body, attributes, type)
    htmlContent = processAssets(htmlContent, type, slug)
    
    const dateObj = attributes.date ? new Date(attributes.date) : new Date()
    const formatted = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`
    
    const rawHandle = attributes.handle
    const handles = Array.isArray(rawHandle) ? rawHandle : (rawHandle ? [rawHandle] : ['kaste'])
    const primaryHandle = handles[0]
    
    const htmlLang = lang === 'en' ? 'en' : 'es'
    const title = attributes.title || slug
    
    const template = `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - octantes.ar</title>
  <link rel="stylesheet" href="/src/04/baseline.css">
  <style>
    body { background: #1B1C1C; color: #D8DADE; padding: 2rem; font-family: 'Outfit', sans-serif; }
    .post { max-width: 800px; margin: 0 auto; }
    .static-nav { display: none; }
    img, video { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="post">
    <nav class="static-nav">
      <a href="/">← BACK TO ARCHIVE</a>
      <span>// ${title}</span>
    </nav>
    ${htmlContent}
  </div>
</body>
</html>`
    
    return template
  } catch (e) {
    if (lang === 'en') return renderNote(type, slug, 'es')
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>404</title></head>
<body style="background:#1B1C1C;color:#D8DADE;font-family:monospace;padding:2rem;">
  <h1>Note not found: ${type}/${slug}</h1>
  <p>${e.message}</p>
  <a href="/" style="color:#8AB6BB;">← Back</a>
</body></html>`
  }

}

function devPlugin() {

  return {
    name: 'vite-dev-content',
    configureServer(server) { 
      server.middlewares.use(async (req, res, next) => { 

        const url = req.url.split('?')[0]
        
        if (url === '/index.json') {
          try {
            const notes = await scanContentDir()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(notes))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }
        
        const match = url.match(/^\/posts\/([^\/]+)\/([^\/]+)\/((index|ingles)\.html)?$/)

        if (match) {
          const [, rawType, slug, , langSuffix] = match
          const type = decodeURIComponent(rawType)
          const lang = langSuffix === 'ingles' ? 'en' : 'es'
          try {
            const html = await renderNote(type, slug, lang)
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
          } catch (e) {
            res.statusCode = 500
            res.end(`Error: ${e.message}`)
          }
          return
        }
        
        const docsPath = path.join('./docs', url)
        try {
          const fileStat = await stat(docsPath)
          if (fileStat.isFile()) {
            const ext = path.extname(url).toLowerCase()
            const mime = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript' }
            res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
            createReadStream(docsPath).pipe(res)
            return
          }
        } catch { /* file not found in docs/, fall through */ }

        next()

      })
    }
  }

}

export default devPlugin