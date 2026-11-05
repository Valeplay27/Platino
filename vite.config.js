import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function getSafeImageFileName(rawName) {
  const fileName = String(rawName || '')
  const extension = path.extname(fileName).toLowerCase()
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
  if (
    !fileName ||
    Buffer.byteLength(fileName, 'utf8') > 255 ||
    fileName.includes('/') ||
    fileName.includes('\\') ||
    [...fileName].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ||
    fileName.endsWith('.') ||
    fileName.endsWith(' ')
  ) {
    throw new Error('El nombre de archivo no es válido.')
  }
  if (!allowedExtensions.has(extension)) {
    throw new Error('El formato de imagen no es compatible.')
  }

  return fileName
}

function getImageMimeType(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png'
  if (buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg'
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'image/gif'
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp'
  }
  return ''
}

function getMultipartParts(body, boundary) {
  const marker = Buffer.from(`--${boundary}`)
  const parts = []
  let cursor = 0

  while (true) {
    const markerStart = body.indexOf(marker, cursor)
    if (markerStart < 0) break
    const partStart = markerStart + marker.length
    if (body.subarray(partStart, partStart + 2).toString() === '--') break
    const contentStart = partStart + 2
    const nextMarker = body.indexOf(marker, contentStart)
    if (nextMarker < 0) break
    const part = body.subarray(contentStart, nextMarker - 2)
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
    if (headerEnd >= 0) {
      parts.push({
        headers: part.subarray(0, headerEnd).toString('utf8'),
        content: part.subarray(headerEnd + 4),
      })
    }
    cursor = nextMarker
  }

  return parts
}

function registerLocalImageUpload(server) {
  server.middlewares.use((req, res, next) => {
    const rawUrl = req.url || ''
    const requestUrl = new URL(rawUrl, 'http://localhost')
    const isUpload =
      requestUrl.pathname.endsWith('/api/upload-image') ||
      (requestUrl.pathname.endsWith('/api/index.php') && requestUrl.searchParams.get('route') === '/upload-image')
    if (isUpload && req.method === 'POST') {
      const chunks = []
      let totalBytes = 0
      let tooLarge = false
      req.on('data', (chunk) => {
        totalBytes += chunk.length
        if (totalBytes > 20 * 1024 * 1024) {
          tooLarge = true
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => {
        try {
          if (tooLarge) {
            res.writeHead(413, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'La imagen supera el límite permitido.' }))
            return
          }
          const contentType = req.headers['content-type'] || ''
          const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)
          if (!boundary) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'La solicitud de imagen no es válida.' }))
            return
          }

          const parts = getMultipartParts(Buffer.concat(chunks), boundary[1] || boundary[2].trim())
          let fileName = ''
          let imageBuffer = null
          for (const part of parts) {
            const fieldName = part.headers.match(/name="([^"]+)"/i)?.[1]
            if (fieldName === 'fileName') {
              fileName = part.content.toString('utf8')
            } else if (fieldName === 'image') {
              imageBuffer = part.content
            }
          }
          if (!fileName || !imageBuffer?.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Falta el archivo de imagen.' }))
            return
          }

          const finalFileName = getSafeImageFileName(fileName)
          const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
          }
          if (getImageMimeType(imageBuffer) !== mimeTypes[path.extname(finalFileName).toLowerCase()]) {
            res.writeHead(422, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'El contenido de la imagen no coincide con su extensión.' }))
            return
          }

          const publicImagesDir = path.resolve(process.cwd(), 'public', 'images')
          if (!fs.existsSync(publicImagesDir)) {
            fs.mkdirSync(publicImagesDir, { recursive: true })
          }

          const targetFilePath = path.join(publicImagesDir, finalFileName)
          fs.writeFileSync(targetFilePath, imageBuffer)

          // Si dist/images existe, copiar también allí
          const distImagesDir = path.resolve(process.cwd(), 'dist', 'images')
          if (fs.existsSync(distImagesDir)) {
            fs.copyFileSync(targetFilePath, path.join(distImagesDir, finalFileName))
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, url: `/images/${encodeURIComponent(finalFileName)}` }))
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      return
    }
    next()
  })
}

function localImageUploadPlugin() {
  return {
    name: 'local-image-upload',
    configureServer(server) {
      registerLocalImageUpload(server)
    },
    configurePreviewServer(server) {
      registerLocalImageUpload(server)
    },
  }
}

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
      const storageDir = path.join(outDir, 'storage')
      fs.mkdirSync(storageDir, { recursive: true })
      const htaccessStorage = path.join(srcDir, 'storage', '.htaccess')
      if (fs.existsSync(htaccessStorage)) {
        fs.copyFileSync(htaccessStorage, path.join(storageDir, '.htaccess'))
      } else {
        fs.writeFileSync(path.join(storageDir, '.htaccess'), "Options -Indexes\nRequire all denied\n")
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), localImageUploadPlugin(), copyPhpApiPlugin()],
  // En GitHub Actions (GitHub Pages) la ruta base es "/Platino/", en local o SiteGround es "/"
  base: process.env.GITHUB_ACTIONS ? "/Platino/" : "/",
}))
