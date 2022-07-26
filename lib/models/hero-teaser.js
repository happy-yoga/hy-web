import { ContentType } from './content-type.js'

export class HeroTeaser extends ContentType {
  static get contentTypeId () {
    return 'heroTeaser'
  }

  update ({ sys: { updatedAt }, fields: { backgroundImage, centerImage } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), backgroundImage, centerImage })
    return this
  }

  get backgroundImageUrl () {
    return this.backgroundImage?.de?.fields?.file?.de?.url
  }

  get centerImageUrl () {
    return this.centerImage?.de?.fields?.file?.de?.url
  }
}
