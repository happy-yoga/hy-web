import { NamedRouter, routes } from 'reversical'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'

import { init as initializeContentful } from './lib/clients/contentful.js'
import { router as pagesRouter } from './lib/controllers/pages.js'

import app from './lib/app.js'

await initializeContentful()

app.locals = app.locals || {}
app.locals.routes = routes
app.locals.documentToHtmlString = documentToHtmlString

const namedRouter = new NamedRouter(app)

namedRouter.use('landing-page', '/', pagesRouter)

export default app
