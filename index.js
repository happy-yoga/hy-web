import crypto from 'crypto'
import basicAuth from 'express-basic-auth'

import { NamedRouter, routes } from 'reversical'

import config from './lib/config.js'
import { init as initializeContentful, documentToHtmlString } from './lib/clients/contentful.js'
import { init as initComponentLibAssets, assetUrl } from './lib/assets.js'
import { router as pagesRouter } from './lib/controllers/pages.js'
import { router as webHookRouter } from './lib/controllers/web-hooks.js'

import app from './lib/app.js'
import { PageList } from './lib/models/page-list.js'

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
  console.log('WITH BASIC AUTH ENABLED!!')
  app.use(basicAuth({
    users: { [config.basicAuth.username]: config.basicAuth.password },
    challenge: true,
    realm: crypto.randomBytes(64).toString('hex')
  }))
}

namedRouter.use('page', '/', pagesRouter)

export default app
