import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    apiUrl: 'https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api',
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'webpack',
    },
  },
})