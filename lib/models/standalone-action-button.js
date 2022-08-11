import { ContentType } from './content-type.js'
import { Link } from './link.js'

export class StandaloneActionButton extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'standaloneActionButton' // don't change to teaser Content Type
  }

  update ({ sys: { updatedAt }, fields: { backgroundImage, title, link } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de })
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
