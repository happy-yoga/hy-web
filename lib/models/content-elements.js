import { findAndUpdateOrCreateByContentType, getContentTypeId } from '../clients/contentful.js'

export class ContentElements {
  constructor (entries = []) {
    this.entries = []
    entries.forEach(entry => {
      const contentTypeId = getContentTypeId(entry)
      const instance = findAndUpdateOrCreateByContentType(contentTypeId, entry)

      if (instance) {
        this.entries.push(instance)
      }
    })
  }
}
