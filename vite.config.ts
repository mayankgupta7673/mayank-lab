import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        kanpuriyaChatkara: resolve(import.meta.dirname, 'kanpuriya-chatkara/index.html'),
      },
    },
  },
})
