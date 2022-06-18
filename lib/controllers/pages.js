import express from 'express'
import { capture } from '../helpers/app-helpers.js'
import { Page } from '../models/page.js'

const landingPage = async (req, res, next) => {
  const pages = Page.pages

  if (pages.length <= 0) {
    return next()
  }

  const landingPage = pages[0] // TODO: maybe identify directly by config-var

  res.render('page', { page: landingPage })
}

const subAppWithNamedRouter = bindRouter => {
  const app = express.Router()
  const namedRouter = bindRouter(app)

  namedRouter.get('index', '/', capture(landingPage))

  return app
}

export const router = subAppWithNamedRouter
