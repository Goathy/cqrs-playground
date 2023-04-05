'use strict'

import fastify from 'fastify'
import { TEST_DATABASE } from './prepare-database.mjs'

export async function buildServer () {
  const app = fastify()

  await app.register(import('../../src/database.mjs'), { database: TEST_DATABASE })

  return app
}
