import express from 'express'
import { capture } from '../helpers/app-helpers.js'
import { restartUpdateCycle } from '../clients/contentful.js'

const webHook = async (req, res, next) => {
  restartUpdateCycle()
  res.send('ok')
}

const subAppWithNamedRouter = bindRouter => {
  const app = express.Router()
  const namedRouter = bindRouter(app)

  namedRouter.post('index', '/', capture(webHook))

  return app
}

export const router = subAppWithNamedRouter
