import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: '行情监控', short_name: '行情监控',
        description: '实时基金净值查询，持仓盈亏一目了然',
        theme_color: '#3b82f6', background_color: '#3b82f6',
        display: 'standalone', orientation: 'portrait',
        start_url: '/', scope: '/', lang: 'zh-CN',
        icons: [
          { src: '/icons/pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icons/pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [{ urlPattern: /^\/api\/.*/i, handler: 'NetworkFirst', method: 'GET', options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 3600 } } }],
      },
    }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } },
  },
})
