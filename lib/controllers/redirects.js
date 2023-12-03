import express from 'express'

const redirect = (path, newPath, code = 308) => [path, (_req, res) => {
  console.log(path, '->', newPath)
  res.setHeader('Cache-Control', 'public, max-age=604800')
  res.redirect(code, newPath)
}]

const app = express.Router()

app.get(...redirect('/', '/pages/landing-page', 307))
app.get(...redirect('/neu-bei-happy-yoga/', '/pages/neu-bei-uns'))
app.get(...redirect('/stundenplan/', '/pages/stundenplan'))
app.get(...redirect('/feste-kurse/', '/pages/feste-kurse'))
app.get(...redirect('/workshops/', '/pages/workshops'))
app.get(...redirect('/anusara-yoga-ausbildungen/', '/pages/anusara-r-yoga-immersion-und-ausbildung'))
app.get(...redirect('/über-uns/', '/pages/ueber-uns'))
app.get(...redirect('/preise/', '/pages/preise'))
app.get(...redirect('/impressum/', '/pages/impressum'))
app.get(...redirect('/online-check-in/', '/pages/online-check-in'))
app.get(...redirect('/über-uns/', '/pages/ueber-uns/'))

export const router = app
