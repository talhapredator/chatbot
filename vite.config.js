import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/upload': 'https://rag-chat-bot-1-c2bq.onrender.com', // Your FastAPI port
      '/query': 'https://rag-chat-bot-1-c2bq.onrender.com'
    }
  },
  plugins: [react()],
})
