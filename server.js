import express from 'express'
import compression from 'compression'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const distPath = path.join(__dirname, 'dist')
const ONE_YEAR_MS = 31536000000

app.use(compression())

app.use(
  express.static(distPath, {
    maxAge: ONE_YEAR_MS,
    cacheControl: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    },
  }),
)

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({
    error: 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`Setty server running on port ${PORT}`)
})
