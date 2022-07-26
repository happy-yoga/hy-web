export class ContentType {
  static elements = []

  constructor ({ sys: { id, createdAt, updatedAt }, fields }) {
    this.contentTypeId = constructor.contentTypeId
    Object.assign(this, { id, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt) })
    this.update({ sys: { updatedAt: this.updatedAt }, fields })
  }

  update () {
    throw new Error('update() just an interface. Please override!')
  }

  static get contentTypeId () {
    throw new Error('contentTypeId is just an interface. Please override!')
  }

  static create (entry) {
    const headlineAndText = new this(entry)
    this.elements.push(headlineAndText)
    return headlineAndText
  }

  static find (id) {
    return this.elements.find(p => p.id === id)
  }
}
