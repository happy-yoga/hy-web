import contentful from 'contentful'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { documentToHtmlString as documentToHtmlStringWithOptions } from '@contentful/rich-text-html-renderer'
import { routes } from 'reversical'

import config from '../config.js'

import { Asset } from '../models/asset.js'
import { Page } from '../models/page.js'
import { HeadlineAndText } from '../models/headline-and-text.js'
import { HeroTeaser } from '../models/hero-teaser.js'
import { MetaData } from '../models/meta-data.js'
import { PageList } from '../models/page-list.js'
import { FullWidthImageTeaser } from '../models/full-width-image-teaser.js'
import { TeaserList } from '../models/teaser-list.js'
import { Link } from '../models/link.js'
import { Teaser } from '../models/teaser.js'
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

registerContentType(Asset)
registerContentType(Page)
registerContentType(HeadlineAndText)
registerContentType(HeroTeaser)
registerContentType(MetaData)
registerContentType(PageList)
registerContentType(FullWidthImageTeaser)
registerContentType(TeaserList)
registerContentType(Link)
registerContentType(Teaser)

const contentfulConnectionConfig = {
  space: contentfulConfig.spaceId,
  accessToken: contentfulConfig.apiKey
}

if (config.contentful.preview) {
  contentfulConnectionConfig.host = 'preview.contentful.com'
}

const client = contentful.createClient(contentfulConnectionConfig)

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
let currentToken

const startSynchronizationLoop = async (nextSyncToken) => {
  console.log('start synchronizing', nextSyncToken ? `(partially: ${nextSyncToken})` : '(full)')

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
    if (response.nextSyncToken) {
      currentToken = response.nextSyncToken
    }

    if (errorneousTries > 0) { // first successful try after some time
      console.log(`first successful contentful synch after ${errorneousTries} tries.`)
      errorneousTries = 0
    }

    console.log('updated content from Contentful:',
      `(${response.entries?.length} new items)`,
      `(${response.deletedEntries?.length} deleted items)`,
      `(${response.assets?.length} new assets)`,
      `(${response.deletedAssets?.length} deleted assets)`
    )
    await parseEntries(response.assets)
    await parseEntries(response.entries)
    await removeDeletedItems(response.deletedEntries)
    await removeDeletedItems(response.deletedAssets)

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
    if (updateCycle) {
      clearTimeout(updateCycle)
    }
    await startSynchronizationLoop(currentToken || undefined)
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
  if (entry?.sys.type === 'Asset') {
    return 'asset'
  }
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
      const image = node.data?.target
      if (image) {
        const file = Asset.find(image?.sys?.id)
        if (file && file.description) {
          return `<figure><img class="embedded-image" src="${file.url}" alt="${file.description}"/><figcaption>${file.description}</figcaption></figure>`
        } else if (file) {
          return `<img class="embedded-image" src="${file.url}" alt="${file.description}"/>`
        }
      }
    }
  }
})

export const documentToHtmlString = html => documentToHtmlStringWithOptions(html, contenfulHTMLRenderingOptions)

function registerContentType (model) {
  contentTypes[model.contentTypeId] = model
}
