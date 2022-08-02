import { ContentType } from './content-type.js'
import { findAndUpdateOrCreate } from '../clients/contentful.js'
export class HeroTeaser extends ContentType {
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
    if (this.resolvedBackgroundImage) {
      return this.resolvedBackgroundImage
    }
    this.resolvedBackgroundImage = findAndUpdateOrCreate(this._backgroundImage?.de)
    return this.resolvedBackgroundImage
  }

  get centerImage () {
    if (!this._centerImage) {
      return {}
    }
    if (this.resolvedCenterImage) {
      return this.resolvedCenterImage
    }
    this.resolvedCenterImage = findAndUpdateOrCreate(this._centerImage?.de)
    return this.resolvedCenterImage
  }
}
