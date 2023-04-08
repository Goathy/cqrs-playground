'use strict'

import process from 'node:process'
import { buildServer } from './server.mjs'

const server = await buildServer({ logger: true })

await server.listen({ port: 3000, host: '0.0.0.0' })

;['SIGINT', 'SIGTERM']
  .forEach((signal) =>
    process.once(signal,
      async () => await server.close()))
