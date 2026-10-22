import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the static build works on GitHub Pages, Netlify or any sub-folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: { exclude: ['@mediapipe/tasks-vision'] },
})
