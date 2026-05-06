import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/datavis/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/**/*'],
      manifest: {
        name: 'Chicago Commute Dashboard',
        short_name: 'Commute',
        description: 'Smart commute routing for Chicago',
        theme_color: '#282a36',
        background_color: '#282a36',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /api\.openweathermap\.org/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 600 } }
          },
          {
            urlPattern: /gbfs\.divvybikes\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'divvy-cache', expiration: { maxAgeSeconds: 60 } }
          },
          {
            urlPattern: /data\.cityofchicago\.org/,
            handler: 'CacheFirst',
            options: { cacheName: 'crime-cache', expiration: { maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /lapi\.transitchicago\.com|ctabustracker\.com/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /maps\.googleapis\.com/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
})
