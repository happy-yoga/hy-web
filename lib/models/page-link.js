import { Page } from './page.js'

export class PageLink {
  constructor (page) {
    this.page = page
  }

  static resolve (pageLink) {
    if (!pageLink.page) {
      return null
    }

    const { sys: { id } } = pageLink.page
    const pageFromPagesRegistry = Page.find(id)

    return pageFromPagesRegistry
  }
}
