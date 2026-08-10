import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveSelkomAssets(): Plugin {
  return {
    name: 'serve-selkom-assets',
    configureServer(server) {
      server.middlewares.use('/assets/selkom', (req, res, next) => {
        const rawUrl = req.url || '/'
        const cleanPath = rawUrl
          .split('?')[0]
          .replace(/^\/assets\/selkom\/?/, '')
          .replace(/^\//, '')

        const candidates = [
          path.join(process.cwd(), 'src', 'assets', 'selkom', cleanPath),
          path.join(process.cwd(), 'public', 'assets', 'selkom', cleanPath),
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
    },
    closeBundle() {
      const srcDir = path.join(process.cwd(), 'src', 'assets', 'selkom')
      const distDir = path.join(process.cwd(), 'dist', 'assets', 'selkom')

      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, distDir, {
          recursive: true,
          filter: (srcPath) => !srcPath.toLowerCase().endsWith('.pdf'),
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveSelkomAssets()],
})
