import { NamedRouter, routes } from 'reversical'

import { router as landingPageRouter } from './lib/controllers/landing-page.js'

import app from './lib/app.js'

app.locals.routes = routes

const namedRouter = new NamedRouter(app)

namedRouter.use('landing-page', '/', landingPageRouter)

export default app
