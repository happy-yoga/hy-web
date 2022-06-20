import { ContentElements } from './content-elements.js'

export class Page {
  static contentTypeId = 'page'
  static pages = []

  constructor ({ sys: { id, createdAt, updatedAt }, fields: { contentElements = [], title, slug } }) {
    this.contentTypeId = Page.contentTypeId
    Object.assign(this, { id, createdAt: new Date(createdAt) })

    this.update({ sys: { updatedAt }, fields: { contentElements, title, slug } })
  }

  update ({ sys: { updatedAt }, fields: { contentElements, title, slug } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, slug: slug?.de })
    this._contentElements = new ContentElements(contentElements?.de)
    return this
  }

  get contentElements () {
    return this._contentElements.resolved()
  }

  static create (entry) {
    const page = new Page(entry)
    this.pages.push(page)
    return page
  }

  static find (id) {
    return this.pages.find(p => p.id === id)
  }

  static findBySlug (slug) {
    return this.pages.find(p => p.slug === slug)
  }
}
