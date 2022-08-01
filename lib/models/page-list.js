import { ContentType } from './content-type.js'
import { PageLink } from './page-link.js'
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

    this._resolvedPages = this._pages.map(PageLink.resolve)

    return this._resolvedPages
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
