import { findAndUpdateOrCreate } from '../clients/contentful.js'

export class ContentElements {
  constructor (entries = []) {
    this.entries = []
    this.add(entries)
  }

  add (entries = []) {
    entries.forEach(entry => {
      const instance = findAndUpdateOrCreate(entry)

      if (instance) {
        this.entries.push(instance)
      }
    })
  }
}
