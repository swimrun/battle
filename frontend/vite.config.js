import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // This ensures assets are loaded from the root
  build: {
    outDir: 'dist',  // Build to the dist directory inside frontend
    emptyOutDir: true,  // Clean the directory before each build
  },
})
