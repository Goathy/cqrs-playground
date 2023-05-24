'use strict'

import process from 'node:process'
import { buildServer, preparePlugins } from './server.mjs'

const server = buildServer({ logger: true })

await preparePlugins(server)

await server.listen({ port: 3000, host: '0.0.0.0' })

;['SIGINT', 'SIGTERM']
  .forEach((signal) =>
    process.once(signal,
      async () => await server.close()))
