import { createReadStream } from 'fs'
import { readFile, stat } from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path'
import { SITE_URL } from './src/04/site-config.js'

const outputDir  = path.resolve('dist')
const contentDir = path.resolve('content')
const devCache   = path.resolve('node_modules/.cache/octantes-build.json')

const types = {
  '.html': 'text/html', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.md': 'text/markdown',
  '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ogg': 'audio/ogg',
}

const text = new Set(['.html', '.json', '.xml', '.txt', '.md', '.css'])

function devPlugin() {

  let running = false
  let again   = false
  let timer   = 0

  function build(server) {

    if (running) { again = true; return }
    running = true

    const t0   = Date.now()
    const proc = spawn(process.execPath, ['buildstep.js'], { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, BUILD_CACHE: devCache } })
    let errors = ''
    proc.stderr.on('data', d => { errors += d })

    proc.on('close', code => {
      running = false
      const log = server.config.logger
      if (code === 0) log.info(`content built in ${((Date.now() - t0) / 1000).toFixed(1)}s`, { timestamp: true })
      else log.error(`content build failed (${code})`, { timestamp: true })
      if (errors.trim()) log.warn(errors.trim())
      if (again) { again = false; build(server) }
      else server.ws.send({ type: 'full-reload' })
    })

  }

  return {

    name: 'vite-dev-content',

    configureServer(server) {

      build(server)

      server.watcher.add(contentDir)
      server.watcher.on('all', (event, file) => {
        if (!path.resolve(file).startsWith(contentDir + path.sep)) return
        clearTimeout(timer)
        timer = setTimeout(() => build(server), 200)
      })

      server.middlewares.use(async (req, res, next) => {

        if (req.method !== 'GET' && req.method !== 'HEAD') return next()

        let url
        try { url = decodeURIComponent(req.url.split('?')[0]) } catch { return next() }
        if (url === '/' || url === '/index.html') return next()

        let file = path.join(outputDir, url)
        if (!file.startsWith(outputDir + path.sep)) return next()

        try {
          let info = await stat(file)
          if (info.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file) }
          if (!info.isFile()) return next()
        } catch { return next() }

        const ext = path.extname(file).toLowerCase()
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')

        if (text.has(ext)) res.end((await readFile(file, 'utf-8')).split(SITE_URL).join(`http://${req.headers.host}`))
        else createReadStream(file).pipe(res)

      })

    },

  }

}

export default devPlugin
