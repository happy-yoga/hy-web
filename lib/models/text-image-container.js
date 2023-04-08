
import { ContentType } from './content-type.js'
import { Asset } from './asset.js'

export class TextImageContainer extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'textImageContainer'
  }

  update ({ sys: { updatedAt }, fields: { image, direction } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), direction: direction?.de })
    this._image = image?.de

    return this
  }


  get image () {
    if (!this._image) {
      return {}
    }

    return Asset.find(this._image?.sys?.id)
  }
}
