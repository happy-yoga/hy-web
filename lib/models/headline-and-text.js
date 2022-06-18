export class HeadlineAndText {
  static contentTypeId = 'headlineAndText'
  static elements = []

  constructor ({ sys: { id, createdAt, updatedAt }, fields: { headline, text } }) {
    this.contentTypeId = HeadlineAndText.contentTypeId
    Object.assign(this, { id, createdAt: new Date(createdAt) })
    this.update({ sys: { updatedAt }, fields: { headline, text } })
  }

  update ({ sys: { updatedAt }, fields: { headline, text } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), headline: headline?.de, text: text?.de })
    return this
  }

  static create (entry) {
    const headlineAndText = new HeadlineAndText(entry)
    this.elements.push(headlineAndText)
    return headlineAndText
  }

  static find (id) {
    return this.elements.find(p => p.id === id)
  }
}
