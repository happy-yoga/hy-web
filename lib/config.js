const env = process.env

const config = {
  port: env.PORT,
  contentful: {
    spaceId: env.CONTENTFUL_SPACE_ID,
    apiKey: env.CONTENTFUL_API_KEY
  }
}

export default config
