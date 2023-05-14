import { itemRegistry } from '../clients/contentful.js'
import { ContentType } from './content-type.js'

export class ImageGallery extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'imageGallery'
  }

  update ({ sys: { updatedAt }, fields: { title, images } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de })
    this._images = [].concat(images?.de)
    return this
  }

  get images () {
    return this._images.map(t => itemRegistry.get(t?.sys?.id))
  }
}
