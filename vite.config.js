import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './ultra-advanced-index.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
})