import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  runtimeConfig: {
    public: {
      env: process.env.NODE_ENV || 'development',
      apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://localhost:5000/api'
    }
  },

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],
  icon: {
    customCollections: [
      {
        prefix: 'icons',
        dir: '~/assets/icons',
      }
    ]
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@nuxt/icon', '@pinia/nuxt'],
})