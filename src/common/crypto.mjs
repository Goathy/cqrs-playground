'use strict'

import { randomUUID } from 'node:crypto'
import fp from 'fastify-plugin'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default fp(async function (app) {
  app.decorate('crypto', {
    uuid: () => randomUUID()
  })
})
