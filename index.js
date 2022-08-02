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

namedRouter.use('page', '/', pagesRouter)
namedRouter.use('webhooks', '/web-hook', webHookRouter)

export default app
