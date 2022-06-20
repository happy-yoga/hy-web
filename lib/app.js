import express from 'express'
// import helmet from 'helmet'
import morgan from 'morgan'
import 'pug'

import config from './config.js'

const app = express()

// app.use(helmet())
app.use(morgan('combined'))
app.set('view engine', 'pug')
app.set('views', './lib/views')

if (config.localAssetDevelopment) {
  app.use('/assets', express.static('node_modules/hy-pattern-lib'))
}

export default app
