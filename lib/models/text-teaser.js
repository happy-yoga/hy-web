import { ContentType } from './content-type.js'
import { Link } from './link.js'

export class TextTeaser extends ContentType {
  static get contentTypeId () {
    return 'textTeaser'
  }

  update ({ sys: { updatedAt }, fields: { title, link, text } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, text: text?.de })
    this._link = link?.de

    return this
  }

  get link () {
    if (!this._link) {
      return {}
    }
    return Link.find(this._link?.sys?.id)
  }
}
