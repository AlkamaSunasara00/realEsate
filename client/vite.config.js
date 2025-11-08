import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows LAN and ngrok access
    port: 5173, // or whatever your vite runs on
    strictPort: true, // keeps it fixed to that port
    cors: true, // sometimes helps
  },
})
