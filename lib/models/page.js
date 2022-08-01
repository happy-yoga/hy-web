import { ContentType } from './content-type.js'
import { ContentElements } from './content-elements.js'
import { HeroTeaser } from './hero-teaser.js'
import { MetaData } from './meta-data.js'
export class Page extends ContentType {
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
    if (this._resolvedContentElements) {
      return this._resolvedContentElements
    }
    this._resolvedContentElements = this._contentElements.resolved()
    return this._resolvedContentElements
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
    if (this._resolvedMetaData) {
      return this._resolvedMetaData
    }

    if (this._metaData) {
      this._resolvedMetaData = new MetaData(this._metaData)
    }

    return this._resolvedMetaData
  }

  static findBySlug (slug) {
    return this.elements.find(p => p.slug === slug)
  }
}
