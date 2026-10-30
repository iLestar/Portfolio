import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El proxy manda /api al backend NestJS en desarrollo,
// así el frontend nunca hardcodea el host del servidor.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
