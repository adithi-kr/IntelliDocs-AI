import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE is set to "/<repo-name>/" when building for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
