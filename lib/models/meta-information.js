import { ContentType } from './content-type.js'

export class MetaInformation extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'metaInformation'
  }

  update ({ sys: { updatedAt }, fields = {} }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), fields })
    this.slug = fields.slug?.de
    return this
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
