import { itemRegistry } from '../clients/contentful.js'
import { ContentType } from './content-type.js'

export class TeaserList extends ContentType {
  static get contentTypeId () {
    return 'teaserList'
  }

  update ({ sys: { updatedAt }, fields: { title, teasers } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de })
    this._teasers = [].concat(teasers?.de)
    return this
  }

  get teasers () {
    console.log(this._teasers)
    return this._teasers.map(t => itemRegistry.get(t?.sys?.id))
  }
}
