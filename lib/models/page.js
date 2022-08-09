import { ContentType } from './content-type.js'
import { ContentElements } from './content-elements.js'
import { HeroTeaser } from './hero-teaser.js'
import { MetaData } from './meta-data.js'
export class Page extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'page'
  }

  update ({ sys: { updatedAt }, fields: { heroTeaser = {}, metaData = {}, contentElements = [], title, slug } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, slug: slug?.de })
    this._contentElements = new ContentElements(contentElements?.de)
    this._heroTeaser = heroTeaser?.de
    this._metaData = metaData?.de
    return this
  }

  get contentElements () {
    return this._contentElements.resolved()
  }

  get heroTeaser () {
    if (this._resolvedHeroTeaser) {
      return this._resolvedHeroTeaser
    }

    if (this._heroTeaser) {
      this._resolvedHeroTeaser = new HeroTeaser(this._heroTeaser)
    }

    return this._resolvedHeroTeaser
  }

  get metaData () {
    this._resolvedMetaData = MetaData.find(this._metaData?.sys?.id)
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
