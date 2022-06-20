const env = process.env

const config = {
  port: env.PORT,
  contentful: {
    spaceId: env.CONTENTFUL_SPACE_ID,
    apiKey: env.CONTENTFUL_API_KEY,
    updateInterval: env.CONTENTFUL_UPDATE_EVERY_X_MINUTES || 5
  },
  localAssetDevelopment: env.LOCAL_ASSET_DEVELOPMENT
}

export default config
