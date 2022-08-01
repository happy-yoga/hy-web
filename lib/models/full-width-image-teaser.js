import { ContentType } from './content-type.js'
import { PageLink } from './page-link.js'

import { routes } from 'reversical'

export class FullWidthImageTeaser extends ContentType {
  static get contentTypeId () {
    return 'fullWidthImageTeaser'
  }

  update ({ sys: { updatedAt }, fields: { title, headline, pageLink, externalLink, backgroundImage, teaserText, linkText } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, headline: headline?.de, externalLink: externalLink?.de, linkText: linkText?.de, teaserText: teaserText?.de })
    this.pageLink = new PageLink(pageLink?.de)
    const backgroundImageFields = backgroundImage?.de?.fields
    this.backgroundImage = {}

    if (backgroundImageFields) {
      this.backgroundImage.url = backgroundImageFields.file?.de?.url
      this.backgroundImage.description = backgroundImageFields.file?.de?.description
    }

    return this
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
