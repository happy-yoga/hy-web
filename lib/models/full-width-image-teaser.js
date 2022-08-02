
import { routes } from 'reversical'

import { ContentType } from './content-type.js'
import { PageLink } from './page-link.js'
import { findAndUpdateOrCreate } from '../clients/contentful.js'

export class FullWidthImageTeaser extends ContentType {
  static get contentTypeId () {
    return 'fullWidthImageTeaser'
  }

  update ({ sys: { updatedAt }, fields: { title, headline, pageLink, externalLink, backgroundImage, teaserText, linkText } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, headline: headline?.de, externalLink: externalLink?.de, linkText: linkText?.de, teaserText: teaserText?.de })
    this.pageLink = new PageLink(pageLink?.de)
    this._backgroundImage = backgroundImage

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

  get link () {
    if (this.pageLink) {
      const page = PageLink.resolve(this.pageLink)
      return { url: routes.page.bySlug({ slug: page.slug }) }
    } else {
      return { url: this.externalLink }
    }
  }
}
