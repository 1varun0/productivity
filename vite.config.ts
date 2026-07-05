import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'ui-vendor';
            if (id.includes('react-markdown') || id.includes('remark-gfm')) return 'editor-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
