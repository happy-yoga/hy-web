#!/usr/bin/env node

import config from '../lib/config.js'
import app from '../index.js'

const server = app.listen(config.port, () => {
  console.log(`started at http://localhost:${server.address().port}`)
})
