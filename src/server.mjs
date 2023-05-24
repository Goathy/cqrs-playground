'use strict'

import fastify from 'fastify'

/**
 * @param {import('fastify').FastifyServerOptions} opts
 * @returns {import('fastify').FastifyInstance}
 */
export function buildServer (opts) {
  return fastify(opts)
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
export async function preparePlugins (fastify) {
  await fastify.register(import('@fastify/swagger'))
  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full'
    }
  })

  await fastify.register(import('./common/errors/error.handler.mjs'))
  await fastify.register(import('./common/crypto/crypto.mjs'))

  await fastify.register(import('./database.mjs'), { database: 'dev.sqlite' })
  await fastify.register(import('./authentication/plugin.mjs'), { prefix: 'authentication' })

  return fastify
}
