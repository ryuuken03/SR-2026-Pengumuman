import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveLocalAssets(): Plugin {
  return {
    name: 'serve-local-assets',
    configureServer(server) {
      const handleAssetPrefix = (prefix: string, baseSubdir: string) => {
        server.middlewares.use(prefix, (req, res, next) => {
          const rawUrl = req.url || '/'
          const cleanPath = rawUrl
            .split('?')[0]
            .replace(new RegExp(`^\\${prefix}\\/?`), '')
            .replace(/^\//, '')

          const candidates = [
            path.join(process.cwd(), 'src', 'assets', baseSubdir, cleanPath),
            path.join(process.cwd(), 'public', 'assets', baseSubdir, cleanPath),
          ]

          for (const filePath of candidates) {
            try {
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase()
                if (ext === '.json') {
                  res.setHeader('Content-Type', 'application/json; charset=utf-8')
                } else if (ext === '.js') {
                  res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
                }

                fs.createReadStream(filePath).pipe(res)
                return
              }
            } catch {
              // continue to next candidate
            }
          }

          next()
        })
      }

      handleAssetPrefix('/assets/selkom', 'selkom')
      handleAssetPrefix('/assets/skt', 'skt')
    },
    buildStart() {
      if (process.env.VERCEL) {
        const pdfPaths = [
          path.join(process.cwd(), 'src', 'assets', 'selkom', 'pengumuman_selkom.pdf'),
          path.join(process.cwd(), 'src', 'assets', 'skt', 'pengumuman_skt.pdf'),
        ]
        for (const pdfPath of pdfPaths) {
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath)
              console.log(`[Vercel Build] Removed PDF: ${path.basename(pdfPath)}`)
            } catch {}
          }
        }
      }
    },
    closeBundle() {
      for (const subdir of ['selkom', 'skt']) {
        const srcDir = path.join(process.cwd(), 'src', 'assets', subdir)
        const distDir = path.join(process.cwd(), 'dist', 'assets', subdir)

        if (fs.existsSync(srcDir)) {
          fs.cpSync(srcDir, distDir, {
            recursive: true,
            filter: (srcPath) => !srcPath.toLowerCase().endsWith('.pdf'),
          })
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveLocalAssets()],
})
