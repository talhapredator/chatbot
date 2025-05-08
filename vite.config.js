import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/upload': 'https://2b5b-202-47-34-45.ngrok-free.app', // Your FastAPI port
      '/query': 'https://2b5b-202-47-34-45.ngrok-free.app'
    }
  },
  plugins: [react()],
})
