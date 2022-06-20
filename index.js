import { NamedRouter, routes } from 'reversical'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'

import config from './lib/config.js'
import { init as initializeContentful } from './lib/clients/contentful.js'
import { init as initComponentLibAssets, assetUrl } from './lib/assets.js'
import { router as pagesRouter } from './lib/controllers/pages.js'

import app from './lib/app.js'

await initializeContentful()
await initComponentLibAssets()

app.locals = app.locals || {}
app.locals.routes = routes
app.locals.documentToHtmlString = documentToHtmlString

if (config.localAssetDevelopment) {
  app.use(async (_req, _res, next) => {
    await initComponentLibAssets() // reload assets on each request
    return next()
  })
}

app.locals.assetUrl = assetUrl

const namedRouter = new NamedRouter(app)

namedRouter.use('page', '/', pagesRouter)

export default app
