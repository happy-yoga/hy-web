
import express from 'express'

const redirect = (path, newPath, code = 308) => [path, (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=604800')
  res.redirect(code, newPath)
}]

const app = express.Router()

app.get(...redirect('/', '/pages/landing-page', 307))
app.get(...redirect('/neu-bei-happy-yoga/', '/pages/neu-bei-uns'))
app.get(...redirect('stundenplan/', '/pages/stundenplan'))

export const router = app
