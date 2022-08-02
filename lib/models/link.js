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
    let url
    if (this._pageLink) {
      const page = Page.find(this._pageLink?.de?.sys?.id)
      if (page?.slug) {
        url = routes.page.bySlug({ slug: page.slug })
      }
    } else if (this.externalLink) {
      url = this.externalLink
    }
    if (url) {
      if (this.anchor) {
        return `${url}#anchor-${this.anchor}`
      }
      return url
    }
    return null
  }
}
