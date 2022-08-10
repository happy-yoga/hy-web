import express from 'express'
// import helmet from 'helmet'
import morgan from 'morgan'
import 'pug'

import favicon from 'serve-favicon'

import config, { LOG_LEVELS } from './config.js'

const app = express()

// app.use(helmet())

app.locals = app.locals || {}

app.locals.debugObject = obj => JSON.stringify(obj, null, 2)

if (config.logLevel >= LOG_LEVELS.VERBOSE) {
  app.use(morgan('combined'))
}

app.set('view engine', 'pug')
app.set('views', './lib/views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(favicon('node_modules/hy-pattern-lib/dist/images/favicon.ico'))

if (config.localAssetDevelopment) {
  app.use('/assets', express.static('node_modules/hy-pattern-lib'))
}

export default app
