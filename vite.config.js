import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devPlugin from './vite.dev-plugin.js'

export default defineConfig({
  plugins: [ vue(), devPlugin() ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, },
  build: { outDir: 'dist', emptyOutDir: true, },
  optimizeDeps: { include: ['markdown-it', 'front-matter'] }
})