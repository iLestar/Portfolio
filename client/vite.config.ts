import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// El proxy manda /api al backend NestJS en desarrollo,
// así el frontend nunca hardcodea el host del servidor.
export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': {
        target: 'http://localhost:3000',
        // Publicados: archivos estáticos. Subidas nuevas/borradores: API local.
        bypass(req) {
          const path = req.url?.split('?')[0] ?? ''
          if (/^\/uploads\/[\w.-]+$/.test(path) && !path.includes('..') && existsSync(fileURLToPath(new URL(`./public${path}`, import.meta.url)))) return path
        },
      },
    },
  },
})
