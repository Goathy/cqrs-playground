'use strict'

import { randomBytes, randomUUID, scrypt } from 'node:crypto'
import fp from 'fastify-plugin'
import { promisify } from 'node:util'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default fp(async function (app) {
  app.decorate('crypto', {
    uuid: () => randomUUID(),
    genSalt: (len) => randomBytes(len).toString('hex').slice(0, len),
    genHash: (password, salt, len) => promisify(scrypt)(password, salt, len)
  })
})
