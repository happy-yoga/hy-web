import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import 'pug'

import favicon from 'serve-favicon'

import config, { LOG_LEVELS } from './config.js'
import { assetPatLibPath, init as initComponentLibAssets, assetUrl } from './assets.js'

const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'script-src': [
        "'self'",
        'https://unpkg.com',
        'https://cdn.jsdelivr.net'
      ],
      'img-src': [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://images.ctfassets.net'
      ]
    }
  }
}))

app.locals = app.locals || {}

app.locals.debugObject = obj => JSON.stringify(obj, null, 2)

if (config.logLevel >= LOG_LEVELS.VERBOSE) {
  app.use(morgan('combined'))
}

app.set('view engine', 'pug')
app.set('views', './lib/views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

await initComponentLibAssets()
if (config.localAssetDevelopment) {
  app.use(async (_req, _res, next) => {
    await initComponentLibAssets() // reload assets on each request
    return next()
  })
}

app.locals.assetUrl = assetUrl

app.use(favicon(assetPatLibPath('favicon.ico')))

if (config.localAssetDevelopment) {
  app.use('/dist', express.static('node_modules/hy-pattern-lib/dist'))
}
app.use('/dist/css-images', express.static('node_modules/hy-pattern-lib/css-images'))

export default app
