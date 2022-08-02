import { ContentType } from './content-type.js'
import { Asset } from './asset.js'
import { Link } from './link.js'

export class ImageTeaser extends ContentType {
  static get contentTypeId () {
    return 'imageTeaser'
  }

  update ({ sys: { updatedAt }, fields: { backgroundImage, title, link, showLinkAsActionButton } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, showLinkAsActionButton: showLinkAsActionButton?.de })
    this._backgroundImage = backgroundImage?.de
    this._link = link?.de

    return this
  }

  get link () {
    if (!this._link) {
      return {}
    }
    return Link.find(this._link?.sys?.id)
  }

  get backgroundImage () {
    if (!this._backgroundImage) {
      return {}
    }
    if (this.resolvedBackgroundImage) {
      return this.resolvedBackgroundImage
    }
    this.resolvedBackgroundImage = Asset.find(this._backgroundImage?.sys?.id)
    return this.resolvedBackgroundImage
  }
}
