import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devPlugin from './build/vite.dev-plugin.js'
import { gameOf } from './build/exports.js'
import { MOBILE_MAX } from './src/04/config.js'
import { headFor, renderHead } from './src/04/map.js'

const ALONE   = { emptyOutDir: true, modulePreload: false, cssCodeSplit: false, assetsDir: '', rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: '[name][extname]' } } }
const EDITION = { ...ALONE, outDir: 'edition' }
const here    = path => fileURLToPath(new URL(path, import.meta.url))

function game(slug) {
  const store = here('./src/04/store.js'), alone = here('./games/store.js')
  return {
    root: here('./games'), publicDir: false,
    define: { __GAME__: JSON.stringify(gameOf(slug)) },
    alias: { '@game': here(`./games/${slug}/game.vue`) },
    plugin: { name: 'game-store', enforce: 'pre', async resolveId(source, importer) { if (!/04\/store\.js$/.test(source)) return; const found = await this.resolve(source, importer, { skipSelf: true }); return found?.id === store ? alone : null } },
    build: { ...ALONE, outDir: here(`./export/${slug}`) },
  }
}

export default defineConfig(({ mode }) => {

  const playing = mode === 'game' && game(process.env.GAME)

  return {
    ...(playing && { root: playing.root, publicDir: playing.publicDir, define: playing.define }),
    base: mode === 'edition' || playing ? './' : '/',
    plugins: [
      vue(),
      playing ? playing.plugin : devPlugin(),
      {
        name: 'breakpoints',
        enforce: 'pre',
        transform(code, id) {
          if (!/\.(vue|css)$/.test(id.split('?')[0])) return
          return code.replaceAll('(--mobile)', `(max-width: ${MOBILE_MAX}px)`).replaceAll('(--desktop)', `(min-width: ${MOBILE_MAX + 1}px)`)
        }
      },
      {
        name: 'head',
        transformIndexHtml(html) {
          return html.replace('__HEAD__', renderHead(headFor({ kind: 'home' }, 'es')))
        }
      }
    ],
    optimizeDeps: { entries: ['index.html'] },
    resolve: { alias: { '@': here('./src'), ...playing?.alias }, },
    build: playing ? playing.build : mode === 'edition' ? EDITION : { outDir: 'dist', emptyOutDir: true },
  }

})