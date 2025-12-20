import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Dhanya Fleet - Mobile App',
                short_name: 'Dhanya Fleet',
                description: 'Manage car rentals on the go - Works on all devices',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'any', // Allow both portrait and landscape
                scope: '/',
                start_url: '/',
                id: '/',
                categories: ['business', 'productivity'],
                lang: 'en',
                dir: 'ltr',
                prefer_related_applications: false,
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: 'apple-touch-icon.png',
                        sizes: '180x180',
                        type: 'image/png',
                        purpose: 'apple touch icon'
                    }
                ],
                screenshots: [
                    {
                        src: 'screenshot-mobile.png',
                        sizes: '390x844',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Mobile Dashboard'
                    },
                    {
                        src: 'screenshot-tablet.png',
                        sizes: '820x1180',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Tablet Dashboard'
                    }
                ]
            },
            workbox: {
                // Cache all static assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
                // Skip waiting and claim clients immediately
                skipWaiting: true,
                clientsClaim: true,
                // Runtime caching strategies
                runtimeCaching: [
                    // Supabase API calls - Network First with fallback
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            },
                            networkTimeoutSeconds: 10
                        }
                    },
                    // Supabase Auth - Network Only (don't cache auth)
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
                        handler: 'NetworkOnly'
                    },
                    // Supabase Storage - Cache First for documents/images
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'supabase-storage-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // Google Fonts - Cache First
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // Images - Stale While Revalidate
                    {
                        urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    }
                ]
            },
            // Dev options
            devOptions: {
                enabled: false // Disable SW in development
            }
        })
    ],
    // Build options for better compatibility
    build: {
        target: ['es2015', 'safari11', 'chrome58', 'firefox57'],
        cssTarget: ['chrome58', 'safari11'],
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    supabase: ['@supabase/supabase-js'],
                    ui: ['lucide-react', 'react-hot-toast']
                }
            }
        }
    },
    // Server config
    server: {
        port: 5174,
        host: true // Allow access from network (for testing on real devices)
    },
    // Preview config
    preview: {
        port: 5174,
        host: true
    }
})
