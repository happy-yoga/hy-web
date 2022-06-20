import contentful from 'contentful'
import { INLINES } from '@contentful/rich-text-types'
import { documentToHtmlString as documentToHtmlStringWithOptions } from '@contentful/rich-text-html-renderer'
import { routes } from 'reversical'

import config from '../config.js'

import { Page } from '../models/page.js'
import { HeadlineAndText } from '../models/headline-and-text.js'

const { contentful: contentfulConfig } = config

const contentfulItemRegistry = {}

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

const parseEntries = async (entries = []) => {
  await Promise.all(entries.map(entry => parseEntry(entry)))
}

const removeDeletedItems = async (entries = []) => {
  // TODO: handle deleted Items
  // await Promise.all(entries.map(entry => parseEntry(entry)))
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
  contentfulItemRegistry[element.id] = element
  return element
}

export const findAndUpdateOrCreate = (entry) => {
  const entryId = entry.sys.id
  const contentTypeId = getContentTypeId(entry)
  const existingEntry = contentfulItemRegistry[entryId] ? contentfulItemRegistry[entryId] : null

  if (existingEntry) {
    if (entry.sys.type === 'Link') { // if it is a link, the Item itself has not been updated!
      return existingEntry
    }

    return existingEntry.update(entry)
  } else if (contentTypes[contentTypeId]) {
    return createByContentType(contentTypeId, entry)
  } else {
    console.log('found unknown content-type:', contentTypeId, 'for element:', entry)
  }
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
      if (contentfulItemRegistry[pageId]) {
        path = routes.page.bySlug({ slug: page.slug })
      } else {
        path = routes.page.byId({ id: page.id })
      }

      return `<a href="${path}" title="${title}">${documentToHtmlStringWithOptions({ content: node.content })}</a>`
    }
  }
})

export const documentToHtmlString = html => documentToHtmlStringWithOptions(html, contenfulHTMLRenderingOptions)

function registerContentType (model) {
  contentTypes[model.contentTypeId] = model
}
