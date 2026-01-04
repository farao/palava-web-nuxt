// https://nuxt.com/docs/api/configuration/nuxt-config

import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  // Runtime configuration - accessible via usePalavaConfig()
  runtimeConfig: {
    public: {
      rtcUrl: process.env.VUE_APP_RTC_URL || 'ws://localhost:4233',
      stunUrl: process.env.VUE_APP_STUN_URL || 'stun:stun.palava.tv',
      turnUrls: process.env.VUE_APP_TURN_URLS || undefined,
      filterIceCandidateTypes: process.env.VUE_APP_FILTER_ICE_CANDIDATE_TYPES || undefined,
    }
  },

  modules: [
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],

  vite: {
    //resolve: {
    //  alias: {
    //    'palava-client-legacy': 'palava-client/palava.bundle.js'
    //  }
    //},
    //optimizeDeps: {
    //  include: ['palava-client']
    //},
    plugins: [
      svgLoader()
    ]
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.ts' }
    ],
    defaultLocale: 'en',
    compilation: {
      strictMessage: false,
    },
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root',
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'palava.tv',
      short_name: 'palava.tv',
      description: 'palava.tv is a cost-free, simple to use, secure, and open source platform for video calls',
      theme_color: '#2c5aa0',
      background_color: '#f0f0f0',
      display: 'standalone',
      icons: [
        {
          src: '/favicons/palava-favicon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/favicons/palava-favicon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
  },

  // CSS
  css: ['~/assets/css/styles.scss'],

  // App configuration
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'palava.tv is a cost-free, simple to use, secure, and open source platform for video calls' },
        { name: 'keywords', content: 'webrtc,video chat,conference,free' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'palava.tv' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'theme-color', content: '#2c5aa0' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/palava-favicon-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/palava-favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicons/palava-favicon-96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicons/palava-favicon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicons/palava-favicon-512.png' },
        { rel: 'apple-touch-icon', href: '/favicons/palava-favicon-120.png' },
        { rel: 'apple-touch-icon', sizes: '128x128', href: '/favicons/palava-favicon-128.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicons/palava-favicon-152.png' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/favicons/palava-favicon-167.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/palava-favicon-180.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/favicons/palava-favicon-512.png' },
        // Apple splash screens
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-1136-640.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)', href: '/apple-splash/apple-splash-2436-1125.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-1792-828.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-828-1792.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-1334-750.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)', href: '/apple-splash/apple-splash-1242-2688.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)', href: '/apple-splash/apple-splash-2208-1242.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)', href: '/apple-splash/apple-splash-1125-2436.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)', href: '/apple-splash/apple-splash-1242-2208.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-2732-2048.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)', href: '/apple-splash/apple-splash-2688-1242.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-2224-1668.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-750-1334.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-2048-2732.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-2388-1668.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-1668-2224.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-640-1136.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-1668-2388.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)', href: '/apple-splash/apple-splash-2048-1536.png' },
        { rel: 'apple-touch-startup-image', media: 'screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)', href: '/apple-splash/apple-splash-1536-2048.png' }
      ]
    }
  }
})
