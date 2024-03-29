import crypto from 'crypto'
import basicAuth from 'express-basic-auth'

import { NamedRouter, routes } from 'reversical'
import { capture } from './lib/helpers/app-helpers.js'
import { assetUrl } from './lib/assets.js'

import config from './lib/config.js'
import { documentToHtmlString } from './lib/clients/contentful.js'

import { router as pagesRouter } from './lib/controllers/pages.js'
import { router as webHookRouter } from './lib/controllers/web-hooks.js'
import { router as redirectsRouter } from './lib/controllers/redirects.js'

import app from './lib/app.js'
import { PageList } from './lib/models/page-list.js'
import { sitemapController } from './lib/controllers/sitemap.js'
import { MetaInformation } from './lib/models/meta-information.js'

app.locals.documentToHtmlString = documentToHtmlString
app.locals.routes = routes

const namedRouter = new NamedRouter(app)

namedRouter.use('webhook', '/web-hook', webHookRouter)

if (config.basicAuth) {
  app.use(basicAuth({
    users: { [config.basicAuth.username]: config.basicAuth.password },
    challenge: true,
    realm: config.basicAuth.realm || crypto.randomBytes(64).toString('hex')
  }))
}

app.use('/', redirectsRouter)

app.use('/sitemap.xml', sitemapController)
app.use('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *
Allow: /

Sitemap: https://www.happyyoga.de/sitemap.xml
`)
})

app.get('/site.webmanifest', (_req, res) => {
  res.json({
    name: 'happyyoga.de',
    short_name: 'happyyoga',
    icons: [
      {
        src: assetUrl('android-chrome-192x192.png'),
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: assetUrl('android-chrome-512x512.png'),
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  })
})

app.use((_req, _res, next) => {
  app.locals.mainMenu = PageList.findBySlug('main-menu')
  app.locals.footerLinks = PageList.findBySlug('footer-links')
  app.locals.footerMetaInformation = MetaInformation.findBySlug('footer-meta-information')
  next()
})

namedRouter.use('page', '/pages/', pagesRouter)

app.use(
  capture(async (req, res, _next) => {
    console.log('Not Found: ', req.originalUrl)
    res.status(404)
    res.render('4xx')
  })
)

app.use((error, _req, res, _next) => {
  console.log('------------------------\n\n', '5xx Error:', error.message, '\n\n------------------------\n')
  console.log(error.stack)
  res.status(500)
  res.render('5xx')
})

export default app
