import { ContentType } from './content-type.js'
import { Asset } from './asset.js'
export class HeroTeaser extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'heroTeaser'
  }

  update ({ sys: { updatedAt }, fields: { backgroundImage, centerImage } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt) })
    this._backgroundImage = backgroundImage
    this._centerImage = centerImage

    return this
  }

  get backgroundImage () {
    if (!this._backgroundImage) {
      return {}
    }
    return Asset.find(this._backgroundImage?.de?.sys?.id)
  }

  get centerImage () {
    if (!this._centerImage) {
      return {}
    }
    return Asset.find(this._centerImage?.de?.sys?.id)
  }
}
