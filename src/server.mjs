'use strict'

import fastify from 'fastify'

export async function buildServer (opts) {
  const server = fastify(opts)

  await server.register(import('@fastify/swagger'))
  await server.register(import('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full'
    }
  })

  await server.register(import('./common/errors/error.handler.mjs'))
  await server.register(import('./common/crypto.mjs'))

  await server.register(import('./route.mjs'))
  await server.register(import('./database.mjs'), opts.database !== undefined ? opts.database : { database: 'dev.sqlite' })
  await server.register(import('./authentication/plugin.mjs'), { prefix: 'authentication' })

  return server
}