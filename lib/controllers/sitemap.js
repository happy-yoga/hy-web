import { createGzip } from 'zlib'
import { SitemapStream } from 'sitemap'
import { Page } from '../models/page.js'
import { routes } from 'reversical'

const pagesHiddenFromSitemap = ['impressum', 'datenschutz']

export const sitemapController = async (req, res) => {
  res.header('Content-Type', 'application/xml')
  res.header('Content-Encoding', 'gzip')
  // if we have a cached entry send it

  try {
    const pages = Page.elements
    const smStream = new SitemapStream({ hostname: 'https://www.happyyoga.de/' })
    const pipeline = smStream.pipe(createGzip())

    // pipe your entries or directly write them.

    pages.forEach(page => {
      if (page && page.slug && !pagesHiddenFromSitemap.includes(page.slug)) {
        smStream.write({ url: routes.page.bySlug({ slug: page.slug }), lastmod: page.updatedAt })
      }
    })
    smStream.end()
    pipeline.pipe(res).on('error', (e) => { throw e })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}
