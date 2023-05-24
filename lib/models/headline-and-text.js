import { ContentType } from './content-type.js'

export class HeadlineAndText extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'headlineAndText'
  }

  update ({ sys: { updatedAt }, fields: { headline, showHeadline = { de: true }, text, anchorName } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), headline: headline?.de, showHeadline: showHeadline?.de, text: text?.de, anchorName: anchorName?.de })
    return this
  }
}
