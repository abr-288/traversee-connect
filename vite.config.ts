import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'B-Reserve - Réservation de Voyages',
        short_name: 'B-Reserve',
        description: 'Plateforme de réservation de voyages - Hôtels, vols, trains, voitures, circuits touristiques et événements',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['travel', 'booking'],
        icons: [
          {
            src: 'https://storage.googleapis.com/gpt-engineer-file-uploads/eELbhqThzPVCUnExIw7dfxcDOAj2/uploads/1761678567741-new_logo_bossizG.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://storage.googleapis.com/gpt-engineer-file-uploads/eELbhqThzPVCUnExIw7dfxcDOAj2/uploads/1761678567741-new_logo_bossizG.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Rechercher des vols',
            short_name: 'Vols',
            description: 'Rechercher et réserver des vols',
            url: '/flights',
            icons: [{ src: 'https://storage.googleapis.com/gpt-engineer-file-uploads/eELbhqThzPVCUnExIw7dfxcDOAj2/uploads/1761678567741-new_logo_bossizG.png', sizes: '192x192' }]
          },
          {
            name: 'Rechercher des hôtels',
            short_name: 'Hôtels',
            description: 'Rechercher et réserver des hôtels',
            url: '/hotels',
            icons: [{ src: 'https://storage.googleapis.com/gpt-engineer-file-uploads/eELbhqThzPVCUnExIw7dfxcDOAj2/uploads/1761678567741-new_logo_bossizG.png', sizes: '192x192' }]
          },
          {
            name: 'Mes réservations',
            short_name: 'Réservations',
            description: 'Voir mes réservations',
            url: '/dashboard',
            icons: [{ src: 'https://storage.googleapis.com/gpt-engineer-file-uploads/eELbhqThzPVCUnExIw7dfxcDOAj2/uploads/1761678567741-new_logo_bossizG.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
