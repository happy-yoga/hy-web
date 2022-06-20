import contentful from 'contentful'
import config from '../config.js'
import { Page } from '../models/page.js'
import { HeadlineAndText } from '../models/headline-and-text.js'

const { contentful: contentfulConfig } = config

const contentTypes = {}

registerContentType(Page)
registerContentType(HeadlineAndText)

const client = contentful.createClient({
  space: contentfulConfig.spaceId,
  accessToken: contentfulConfig.apiKey
})

const updateInterval = minuteCount => minuteCount * 60 * 1_000 // time in ms
const UPDATE_LIMIT = 100

let errorneousTries = 0

const parseEntry = async entry => {
  const contentTypeId = getContentTypeId(entry)

  return createByContentType(contentTypeId, entry)
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
    const response = await client.sync(options)

    if (errorneousTries > 0) { // first successful try after some time
      console.log(`first successful contentful synch after ${errorneousTries} tries.`)
      errorneousTries = 0
    }

    await parseEntries(response.entries)
    await removeDeletedItems(response.deletedEntries)

    setTimeout(async () => synchronize(response.nextSyncToken), updateInterval(1))
  } catch (e) {
    errorneousTries += 1
    const nextUpdateInMinutes = Math.min(30, Math.pow(2, errorneousTries))
    console.log(`Errorneous Contentful Synch #${errorneousTries}: Next Update in ${nextUpdateInMinutes} Minutes\n`, e)
    setTimeout(async () => synchronize(nextSyncToken), updateInterval(nextUpdateInMinutes))
  }
}

export const init = async () => {
  await synchronize()
}

export const createByContentType = (contentTypeId, entry) => {
  return contentTypes[contentTypeId]?.create(entry)
}

export const findAndUpdateOrCreateByContentType = (contentTypeId, entry) => {
  if (contentTypes[contentTypeId]) {
    const entryId = entry.sys.id
    const existingEntry = contentTypes[contentTypeId].find(entryId)

    if (existingEntry) {
      return existingEntry.update(entry)
    } else {
      const created = createByContentType(contentTypeId, entry)
      return created
    }
  }
}

export const getContentTypeId = (entry = {}) => {
  const contentType = entry.sys?.contentType
  return contentType?.sys?.id || null
}

function registerContentType (model) {
  contentTypes[model.contentTypeId] = model
}
