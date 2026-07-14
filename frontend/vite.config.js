import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // ⚡ Ensure this proxy path matches the beginning of your Axios calls exactly!
      '/api': {
        target: 'http://localhost:5000', // 👈 Change to your backend server port if it runs on 8000/8080
        changeOrigin: true,
        secure: false,
      }
    }
  }
})