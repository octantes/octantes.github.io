import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devPlugin from './vite.dev-plugin.js'
import { SITE_URL } from './src/site-config.js'

export default defineConfig({
  plugins: [
    vue(),
    devPlugin(),
    {
      name: 'site-url-replace',
      transformIndexHtml(html) {
        return html.replace(/__SITE_URL__/g, SITE_URL)
      }
    }
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, },
  build: { outDir: 'dist', emptyOutDir: true, },
  optimizeDeps: { include: ['markdown-it', 'front-matter'] }
})