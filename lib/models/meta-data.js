import { ContentType } from './content-type.js'

export class MetaData extends ContentType {
  static get contentTypeId () {
    return 'metaData'
  }

  update ({ sys: { updatedAt }, fields: { title, pageTitle, pageDescription, keywords } }) {
    Object.assign(this, { updatedAt: new Date(updatedAt), title: title?.de, pageTitle: pageTitle?.de, pageDescription: pageDescription?.de, keywords: keywords?.de })
    return this
  }
}

const getCookie = name => {
  return document.cookie.split(';').some(c => {
    return c.trim().startsWith(name + '=')
  })
}

const deleteCookie = (name, path, domain) => {
  if (getCookie(name)) {
    document.cookie = `${name}=${(path) ? `;path=${path}` : ''}${(domain) ? `;domain=${domain}` : ''};expires=Thu, 01 Jan 1970 00:00:01 GMT`
  }
}
