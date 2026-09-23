import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devPlugin from './vite.dev-plugin.js'
import { SITE_URL, MOBILE_MAX } from './src/04/site-config.js'

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
      name: 'site-url-replace',
      transformIndexHtml(html) {
        return html.replace(/__SITE_URL__/g, SITE_URL)
      }
    }
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, },
  build: { outDir: 'dist', emptyOutDir: true, },
})