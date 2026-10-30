import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function copyPhpApiPlugin() {
  return {
    name: 'copy-php-api',
    closeBundle() {
      const srcDir = path.resolve(process.cwd(), 'api')
      const outDir = path.resolve(process.cwd(), 'dist', 'api')
      if (!fs.existsSync(srcDir)) return
      fs.mkdirSync(outDir, { recursive: true })
      for (const file of ['.htaccess', 'index.php']) {
        const srcFile = path.join(srcDir, file)
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, path.join(outDir, file))
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), copyPhpApiPlugin()],
  // En GitHub Actions (GitHub Pages) la ruta base es "/Platino/", en local o SiteGround es "/"
  base: process.env.GITHUB_ACTIONS ? "/Platino/" : "/",
}))
