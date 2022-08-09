import { ContentType } from './content-type.js'

export class HeadlineAndText extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'headlineAndText'
  }

  update ({ sys: { updatedAt }, fields: { headline, text, anchorName } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), headline: headline?.de, text: text?.de, anchorName: anchorName?.de })
    return this
  }
}
