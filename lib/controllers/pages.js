import express from 'express'
import { capture } from '../helpers/app-helpers.js'
import { Page } from '../models/page.js'

const pages = async (req, res, next) => {
  const pages = Page.pages

  if (pages.length <= 0) {
    return next()
  }

  res.render('pages', { pages })
}

const page = async (req, res, next) => {
  const { id, slug } = req.params
  let page
  if (id) {
    page = Page.find(parseInt(id))
  } else {
    page = Page.findBySlug(slug)
  }

  if (!page) {
    return next()
  }

  res.render('page', { page })
}

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
  namedRouter.get('all', '/all', capture(pages))
  namedRouter.get('by-id', '/:id', capture(page))
  namedRouter.get('by-slug', '/:slug', capture(page))

  return app
}

export const router = subAppWithNamedRouter
