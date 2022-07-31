import express from 'express'
// import helmet from 'helmet'
import morgan from 'morgan'
import basicAuth from 'express-basic-auth'
import 'pug'

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

if (config.localAssetDevelopment) {
  app.use('/assets', express.static('node_modules/hy-pattern-lib'))
}

if (config.basicAuth) {
  app.use(basicAuth({
    users: { [config.basicAuth.username]: config.basicAuth.password },
    challenge: true,
    realm: 'a3fd04db1718411a5fa811e60e876e678c17579c1708075fdc4d0d4a313013b1'
  }))
}
export default app
