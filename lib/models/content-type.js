export class ContentType {
  static elements = undefined

  constructor ({ sys: { id, createdAt, updatedAt }, fields }) {
    this.contentTypeId = this.constructor.contentTypeId
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
    const element = new this(entry)
    this.elements.push(element)
    return element
  }

  static find (id) {
    return this.elements.find(p => p.id === id)
  }
}
