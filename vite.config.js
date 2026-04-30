import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/recgov': {
        target: 'https://www.recreation.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/recgov/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.recreation.gov/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      '/ridb': {
        target: 'https://ridb.recreation.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ridb/, ''),
      },
    },
  },
})
