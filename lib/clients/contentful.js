import contentful from 'contentful'
import { INLINES } from '@contentful/rich-text-types'
import { documentToHtmlString as documentToHtmlStringWithOptions } from '@contentful/rich-text-html-renderer'
import { routes } from 'reversical'

import config from '../config.js'

import { Page } from '../models/page.js'
import { HeadlineAndText } from '../models/headline-and-text.js'

class ItemRegistry {
  constructor () {
    this.entries = {}
  }

  add (id, entry) {
    this.entries[id] = entry
  }

  delete (id) {
    console.log('deleting item with id', id)
    delete this.entries[id]
  }

  has (id) {
    return Object.hasOwn(this.entries, id)
  }

  get (id) {
    return this.has(id) ? this.entries[id] : null
  }
}

const { contentful: contentfulConfig } = config

export const itemRegistry = new ItemRegistry()

const contentTypes = {}

registerContentType(Page)
registerContentType(HeadlineAndText)

const client = contentful.createClient({
  space: contentfulConfig.spaceId,
  accessToken: contentfulConfig.apiKey
})

const updateIntervalInMs = minuteCount => minuteCount * 60 * 1_000 // time in ms
const UPDATE_LIMIT = 1000

let errorneousTries = 0

const parseEntry = async entry => {
  return findAndUpdateOrCreate(entry)
}

const deleteEntry = async entry => {
  return itemRegistry.delete(entry.sys.id)
}

const parseEntries = async (entries = []) => {
  await Promise.all(entries.map(entry => parseEntry(entry)))
}

const removeDeletedItems = async (entries = []) => {
  await Promise.all(entries.map(entry => deleteEntry(entry)))
}

const synchronize = async (nextSyncToken) => {
  const defaults = { limit: UPDATE_LIMIT }

  const options = Object.assign(
    {},
    defaults,
    nextSyncToken
      ? { nextSyncToken } // only delta synch, when synch token is given
      : { initial: true } // full synch (initially)
  )

  try {
    const response = await client.sync(options, { paginate: true })

    if (errorneousTries > 0) { // first successful try after some time
      console.log(`first successful contentful synch after ${errorneousTries} tries.`)
      errorneousTries = 0
    }

    console.log('updated content from Contentful:', `(${response.entries?.length} new items)`, `(${response.deletedEntries?.length} deleted items)`)
    await parseEntries(response.entries)
    await removeDeletedItems(response.deletedEntries)

    setTimeout(async () => synchronize(response.nextSyncToken), updateIntervalInMs(config.contentful.updateInterval))
  } catch (e) {
    errorneousTries += 1
    const nextUpdateInMinutes = Math.min(30, Math.pow(2, errorneousTries))
    console.log(`Errorneous Contentful Synch #${errorneousTries}: Next Update in ${nextUpdateInMinutes} Minutes\n`, e)
    setTimeout(async () => synchronize(nextSyncToken), updateIntervalInMs(nextUpdateInMinutes))
  }
}

export const init = async () => {
  await synchronize()
}

export const createByContentType = (contentTypeId, entry) => {
  const element = contentTypes[contentTypeId]?.create(entry)
  itemRegistry.add(element.id, element)
  return element
}

export const findAndUpdateOrCreate = (entry, { returnId = false } = {}) => {
  const entryId = entry.sys.id
  const contentTypeId = getContentTypeId(entry)
  const existingEntry = itemRegistry.has(entryId) ? itemRegistry.get(entryId) : null

  let result

  if (existingEntry && entry.sys.type === 'Link') {
    // if it is a link, the Item itself has not been updated!
    result = existingEntry
  } else if (existingEntry) {
    const updated = existingEntry.update(entry)
    result = updated
  } else if (contentTypes[contentTypeId]) {
    const created = createByContentType(contentTypeId, entry)
    result = created
  } else {
    if (entry.sys.type === 'Link' && !existingEntry) { // link but reference is not resolvable
      console.log('found not resolvable link:', entry)
      return null
    }
    console.log('found unknown content-type:', contentTypeId, 'for element:', entry)
    return null // break out without any result item
  }

  return returnId ? result.id : result
}

export const getContentTypeId = (entry = {}) => {
  const contentType = entry.sys?.contentType
  return contentType?.sys?.id || null
}

const contenfulHTMLRenderingOptions = ({
  renderNode: {
    [INLINES.ENTRY_HYPERLINK]: node => {
      const { target } = node.data
      const pageId = target.sys?.id
      const title = target.fields?.title
      const page = Page.find(pageId)

      let path
      if (page && page.slug) {
        path = routes.page.bySlug({ slug: page.slug })
        return `<a href="${path}" title="${title}">${documentToHtmlStringWithOptions({ content: node.content })}</a>`
      } else if (page) {
        path = routes.page.byId({ id: page.id })
      }

      return documentToHtmlStringWithOptions({ content: node.content })
    }
  }
})

export const documentToHtmlString = html => documentToHtmlStringWithOptions(html, contenfulHTMLRenderingOptions)

function registerContentType (model) {
  contentTypes[model.contentTypeId] = model
}
