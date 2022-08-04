import { ContentType } from './content-type.js'
import { Asset } from './asset.js'
import { Link } from './link.js'

export class Teaser extends ContentType {
  static get contentTypeId () {
    return 'imageTeaser' // don't change to teaser Content Type
  }

  update ({ sys: { updatedAt }, fields: { backgroundImage, title, link, showLinkAsActionButton, headline, text, backgroundColor, textColorBrightness } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, showLinkAsActionButton: showLinkAsActionButton?.de, headline: headline?.de, text: text?.de, backgroundColor: backgroundColor?.de, textColorBrightness: textColorBrightness?.de })
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
