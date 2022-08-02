
import { ContentType } from './content-type.js'
import { Asset } from './asset.js'
import { Link } from './link.js'

export class FullWidthImageTeaser extends ContentType {
  static get contentTypeId () {
    return 'fullWidthImageTeaser'
  }

  update ({ sys: { updatedAt }, fields: { title, headline, link, backgroundImage, teaserText, anchorName } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, headline: headline?.de, teaserText: teaserText?.de, anchorName: anchorName?.de })
    this._link = link?.de
    this._backgroundImage = backgroundImage?.de

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

    return Asset.find(this._backgroundImage?.sys?.id)
  }
}
