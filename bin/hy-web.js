#!/usr/bin/env node

import config from '../lib/config.js'
import app from '../index.js'

import { init as initializeContentfulSynchLoop, synchronize } from '../lib/clients/contentful.js'

const response = await synchronize() // wait for initial synch before starting server

const server = app.listen(config.port, () => {
  console.log(`started at http://localhost:${server.address().port}`)
})

await initializeContentfulSynchLoop(response.nextSyncToken)
