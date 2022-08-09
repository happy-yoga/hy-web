import { itemRegistry } from '../clients/contentful.js'
import { ContentType } from './content-type.js'

export class TeaserList extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'teaserList'
  }

  update ({ sys: { updatedAt }, fields: { title, teasers, anchorName } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, anchorName: anchorName?.de })
    this._teasers = [].concat(teasers?.de)
    return this
  }

  get teasers () {
    return this._teasers.map(t => itemRegistry.get(t?.sys?.id))
  }
}
