import { routes } from 'reversical'
import { ContentType } from './content-type.js'
import { Page } from './page.js'

export class Link extends ContentType {
  static get contentTypeId () {
    return 'link'
  }

  update ({ sys: { updatedAt }, fields: { linkLabel, pageLink, externalLink, anchor } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), linkLabel: linkLabel?.de, anchor: anchor?.de, externalLink: externalLink?.de })
    this._pageLink = pageLink

    return this
  }

  get url () {
    if (this._pageLink) {
      const page = Page.find(this._pageLink?.de?.sys?.id)
      if (page?.slug) {
        return routes.page.bySlug({ slug: page.slug })
      }
    } else if (this.externalLink) {
      return this.externalLink
    }

    return null
  }
}
