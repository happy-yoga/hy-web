import express from 'express'
import { capture } from '../helpers/app-helpers.js'

const landingPage = (req, res) => {
  res.render('landing-page')
}

const subAppWithNamedRouter = bindRouter => {
  const app = express.Router()
  const namedRouter = bindRouter(app)

  namedRouter.get('index', '/', capture(landingPage))

  return app
}

export const router = subAppWithNamedRouter
