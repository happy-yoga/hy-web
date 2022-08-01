import { Page } from './page.js'

export class PageLink {
  constructor (page) {
    this.page = page
  }

  static resolve (pageLink) {
    if (!pageLink.page) {
      return null
    }

    const { fields: { slug: { de: slug } } } = pageLink.page
    const pageFromPagesRegistry = Page.findBySlug(slug)

    return pageFromPagesRegistry
  }
}
