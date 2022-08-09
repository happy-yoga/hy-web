import crypto from 'crypto'
import basicAuth from 'express-basic-auth'

import { NamedRouter, routes } from 'reversical'
import { capture } from './lib/helpers/app-helpers.js'

import config from './lib/config.js'
import { init as initializeContentful, documentToHtmlString } from './lib/clients/contentful.js'
import { init as initComponentLibAssets, assetUrl } from './lib/assets.js'
import { router as pagesRouter } from './lib/controllers/pages.js'
import { router as webHookRouter } from './lib/controllers/web-hooks.js'
import { router as redirectsRouter } from './lib/controllers/redirects.js'

import app from './lib/app.js'
import { PageList } from './lib/models/page-list.js'
import { sitemapController } from './lib/controllers/sitemap.js'

await initializeContentful()
await initComponentLibAssets()

app.locals.routes = routes
app.locals.documentToHtmlString = documentToHtmlString

if (config.localAssetDevelopment) {
  app.use(async (_req, _res, next) => {
    await initComponentLibAssets() // reload assets on each request
    return next()
  })
}

app.locals.assetUrl = assetUrl

app.use((_req, _res, next) => {
  app.locals.mainMenu = PageList.findBySlug('main-menu')
  app.locals.footerLinks = PageList.findBySlug('footer-links')
  next()
})

const namedRouter = new NamedRouter(app)

namedRouter.use('webhook', '/web-hook', webHookRouter)

if (config.basicAuth) {
  app.use(basicAuth({
    users: { [config.basicAuth.username]: config.basicAuth.password },
    challenge: true,
    realm: crypto.randomBytes(64).toString('hex')
  }))
}

app.use('/sitemap.xml', sitemapController)
app.use('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`
User-agent: *
Allow: /

Sitemap: https://www.happyyoga.de/sitemap.xml
`)
})
app.use('/', redirectsRouter)

namedRouter.use('page', '/pages/', pagesRouter)

app.use(
  capture(async (_req, res, _next) => {
    res.status(404)
    res.render('4xx')
  })
)

app.use((_error, _req, res, _next) => {
  res.status(500)
  res.render('5xx')
})

export default app
