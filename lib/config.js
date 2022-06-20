const env = process.env

export const LOG_LEVELS = {
  ERROR: 0,
  INFO: 1,
  VERBOSE: 2,
  DEBUG: 3
}

const config = {
  port: env.PORT,
  contentful: {
    spaceId: env.CONTENTFUL_SPACE_ID,
    apiKey: env.CONTENTFUL_API_KEY,
    updateInterval: env.CONTENTFUL_UPDATE_EVERY_X_MINUTES || 5
  },
  localAssetDevelopment: env.LOCAL_ASSET_DEVELOPMENT,
  logLevel: env.LOG_LEVEL
}

export default config
