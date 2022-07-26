import { ContentType } from './content-type.js'

export class HeadlineAndText extends ContentType {
  static get contentTypeId () {
    return 'headlineAndText'
  }

  update ({ sys: { updatedAt }, fields: { headline, text } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), headline: headline?.de, text: text?.de })
    return this
  }
}
