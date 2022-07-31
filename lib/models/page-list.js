import { ContentType } from './content-type.js'
import { Page } from './page.js'

class PageLink {
  constructor (page) {
    // this.page = Page.findBySlug(slug)
    this.page = page
  }
}

export class PageList extends ContentType {
  static get contentTypeId () {
    return 'pageList'
  }

  update ({ sys: { updatedAt }, fields: { title, slug, pages } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, slug: slug.de })
    this._pages = [].concat(pages.de).map(page => new PageLink(page))

    return this
  }

  get pages () {
    if (this._resolvedPages) {
      return this._resolvedPages
    }

    this._resolvedPages = this._pages.map(pageLink => {
      const { fields: { slug: { de: slug } } } = pageLink.page
      const pageFromPagesRegistry = Page.findBySlug(slug)
      return pageFromPagesRegistry
    })

    return this._resolvedPages
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
