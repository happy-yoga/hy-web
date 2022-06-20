import { findAndUpdateOrCreate, itemRegistry } from '../clients/contentful.js'

export class ContentElements {
  constructor (entries = []) {
    this.entries = []
    this.add(entries)
  }

  add (entries = []) {
    entries.forEach(entry => {
      const instanceId = findAndUpdateOrCreate(entry, { returnId: true })
      if (instanceId) { this.entries.push(instanceId) }
    })
  }

  resolved () {
    return this.entries.map(entryId => itemRegistry.get(entryId)).filter(x => !!x)
  }
}
