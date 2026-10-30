import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En GitHub Actions (GitHub Pages) la ruta base es "/Platino/", en local o SiteGround es "/"
  base: process.env.GITHUB_ACTIONS ? "/Platino/" : "/",
}))
