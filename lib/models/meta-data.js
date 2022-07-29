import { ContentType } from './content-type.js'

export class MetaData extends ContentType {
  static get contentTypeId () {
    return 'metaData'
  }

  update ({ sys: { updatedAt }, fields: { title, pageTitle, pageDescription, keywords } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, pageTitle: pageTitle?.de, pageDescription: pageDescription?.de, keywords: keywords?.de })
    return this
  }
}
