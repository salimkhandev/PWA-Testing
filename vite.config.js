import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      manifest: false,
      useManifestFromFile: true,
      injectRegister: null,
      injectManifest: {
        injectionPoint: undefined
      }
    })
  ],
})
