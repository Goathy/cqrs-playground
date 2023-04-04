'use strict'

import fastify from 'fastify'
import { TEST_DATABASE } from './migration.mjs'

export async function buildServer () {
  const app = fastify()

  await app.register(import('../../src/database.mjs'), { database: TEST_DATABASE })

  return app
}
