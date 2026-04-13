import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))
// https://vite.dev/config/
export default defineConfig({
  base: '/patron/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    },
    proxy: {
      '/PHP/asap/TitleRequests.php': {
        target: 'https://dev-jplasap.coj.net/PHP/asap/TitleRequests.php', // Your target endpoint
        changeOrigin: true, // Needed to ensure CORS is handled correctly
      },
      '/PHP/asap/AddTitleRequest.php': {
        target: 'https://dev-jplasap.coj.net/PHP/asap/AddTitleRequest.php', // Your target endpoint
        changeOrigin: true, // Needed to ensure CORS is handled correctly
      },
      '/PHP/asap/UpdateTitleRequest.php': {
        target: 'https://dev-jplasap.coj.net/PHP/asap/UpdateTitleRequest.php', // Your target endpoint
        changeOrigin: true, // Needed to ensure CORS is handled correctly
      },
      '/polaris-api-2.x/login.php': {
        target: 'https://jplasappatron.coj.net/', // Your target endpoint
        changeOrigin: true, // Needed to ensure CORS is handled correctly
      },
      '/patronAuth': {
        target: 'https://dev-jplasap.coj.net/', // Your target endpoint
        changeOrigin: true, // Needed to ensure CORS is handled correctly
      }
    }
  },
  build: {
    outDir: "../deploy-patron",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
    },
  }
})

