import { join } from 'path'
import { readFile } from 'fs/promises'
import config from './config.js'

let manifest, cdnUri

const cdnUriTemplate = (version) => (path) => config.localAssetDevelopment
  ? `${path}`
  : new URL(join(`/npm/hy-pattern-lib@${version}/`, path), 'https://cdn.jsdelivr.net')

export const init = async () => {
  const packageJSON = await loadJSONObject('../node_modules/hy-pattern-lib/package.json')

  const aotcComponentLibVersion = packageJSON.get('version')

  cdnUri = cdnUriTemplate(aotcComponentLibVersion)
  manifest = await loadJSONObject('../node_modules/hy-pattern-lib/dist/manifest.json')
}

export const assetUrl = asset => {
  const relativeAssetPath = manifest.get(asset)
  if (!relativeAssetPath) {
    console.log(`Asset lookup failed: ${asset} cannot be found in component lib`)
    return
  }

  return cdnUri(relativeAssetPath)
}

export const assetPatLibPath = asset => {
  const relativeAssetPath = manifest.get(asset)
  const sanitizedPath = /^\/assets\/.*$/.test(relativeAssetPath) ? relativeAssetPath.match(/\/assets\/(.*)/)[1] : relativeAssetPath
  return join('node_modules', 'hy-pattern-lib', sanitizedPath)
}

async function loadJSONObject (path) {
  const file = await readFile(new URL(path, import.meta.url))
  const parsed = JSON.parse(file)
  return new Map(Object.entries(parsed))
}
