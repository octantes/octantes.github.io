import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devPlugin from './vite.dev-plugin.js'
import { MOBILE_MAX } from './src/04/site-config.js'
import { headFor, renderHead } from './src/04/pages.js'

export default defineConfig({
  plugins: [
    vue(),
    devPlugin(),
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
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, },
  build: { outDir: 'dist', emptyOutDir: true, },
})