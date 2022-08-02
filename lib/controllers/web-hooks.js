import express from 'express'
import { capture } from '../helpers/app-helpers.js'

const webHook = async (req, res, next) => {
  console.log('params', req.params)
  console.log('body', req.body)
  res.send(`<pre>${JSON.stringify(req.body)}</pre>`)
}

const subAppWithNamedRouter = bindRouter => {
  const app = express.Router()
  const namedRouter = bindRouter(app)

  namedRouter.post('index', '/', capture(webHook))

  return app
}

export const router = subAppWithNamedRouter
