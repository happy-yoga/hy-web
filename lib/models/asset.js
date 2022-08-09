import { ContentType } from './content-type.js'

export class Asset extends ContentType {
  static elements = []
  static get contentTypeId () {
    return 'asset'
  }

  update ({ sys: { updatedAt }, fields: { file, description } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), url: file?.de?.url, description: description?.de })
    return this
  }
}
