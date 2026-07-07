import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // listen on LAN so phones on the same Wi-Fi can connect
    proxy: {
      // Forward /api/daily/* → https://api.daily.co/v1/*
      // e.g. POST /api/daily/rooms → POST https://api.daily.co/v1/rooms
      '/api/daily': {
        target: 'https://api.daily.co/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/daily/, ''),
      },
    },
  },
})
