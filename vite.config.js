import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './ultra-advanced-index.html'
      },
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          chartjs: ['chart.js']
        }
      }
    },
    target: 'es2015',
    sourcemap: false
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  define: {
    global: 'globalThis'
  }
})