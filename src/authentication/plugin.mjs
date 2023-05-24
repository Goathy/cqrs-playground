'use strict'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function (app) {
  await app.register(import('./authentication.mjs'))
}
