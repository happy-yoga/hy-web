import contentful from 'contentful'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { documentToHtmlString as documentToHtmlStringWithOptions } from '@contentful/rich-text-html-renderer'
import { routes } from 'reversical'

import config from '../config.js'

import { Page } from '../models/page.js'
import { HeadlineAndText } from '../models/headline-and-text.js'
import { HeroTeaser } from '../models/hero-teaser.js'
import { MetaData } from '../models/meta-data.js'
import { PageList } from '../models/page-list.js'
import { FullWidthImageTeaser } from '../models/full-width-image-teaser.js'

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
registerContentType(HeroTeaser)
registerContentType(MetaData)
registerContentType(PageList)
registerContentType(FullWidthImageTeaser)

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

let updateCycle = false
let restartWish = false
const startSynchronizationLoop = async (nextSyncToken) => {
  console.log('start synchronizing', nextSyncToken ? `(partially: ${nextSyncToken})` : '(full)')

  if (!nextSyncToken && updateCycle) {
    clearTimeout(updateCycle)
  }

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

    updateCycle = setTimeout(async () => startSynchronizationLoop(response.nextSyncToken), updateIntervalInMs(config.contentful.updateInterval))
  } catch (e) {
    errorneousTries += 1
    const nextUpdateInMinutes = Math.min(30, Math.pow(2, errorneousTries))
    console.log(`Errorneous Contentful Synch #${errorneousTries}: Next Update in ${nextUpdateInMinutes} Minutes\n`, e)
    updateCycle = setTimeout(async () => startSynchronizationLoop(nextSyncToken), updateIntervalInMs(nextUpdateInMinutes))
  }
}

const checkRestartSynchWish = async () => {
  if (restartWish) {
    restartWish = false
    await startSynchronizationLoop()
    return setTimeout(() => { checkRestartSynchWish() }, 10_000) // every 10 secs
  }

  setTimeout(() => { checkRestartSynchWish() }, 1_000) // every sec (if no update happens)
}

export const init = async () => {
  await startSynchronizationLoop()
  await checkRestartSynchWish()
}

export const restartUpdateCycle = async () => {
  restartWish = true
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
    },
    [BLOCKS.EMBEDDED_ASSET]: node => {
      // console.log('BLOCKS.EMBEDDED_ASSET]', JSON.stringify(node, null, 2))
      const fields = node.data?.target?.fields
      if (fields) {
        const { description: { de: description }, file: { de: file } } = fields
        if (description) {
          return `<figure><img class="embedded-image" src="${file.url}" alt="${description}"/><figcaption>${description}</figcaption></figure>`
        } else {
          return `<img class="embedded-image" src="${file.url}" alt="${description}"/>`
        }
      }
    }
  }
})

export const documentToHtmlString = html => documentToHtmlStringWithOptions(html, contenfulHTMLRenderingOptions)

function registerContentType (model) {
  contentTypes[model.contentTypeId] = model
}
