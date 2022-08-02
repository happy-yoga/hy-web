import { ContentType } from './content-type.js'
import { Page } from './page.js'

export class PageList extends ContentType {
  static get contentTypeId () {
    return 'pageList'
  }

  update ({ sys: { updatedAt }, fields: { title, slug, pages } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, slug: slug.de })
    this._pages = [].concat(pages.de)
    console.log(this._pages)
    return this
  }

  get pages () {
    return this._pages.map(page => Page.find(page?.sys?.id))
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
