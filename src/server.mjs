'use strict'

import fastify from 'fastify'
import { createUUID, createSalt, createHash, compare } from './authentication/crypto.mjs'

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
  await server.register(import('./common/crypto/crypto.mjs'), {
    builder: (b) => b.setUUID(createUUID)
      .setSalt(createSalt)
      .setHash(createHash)
      .setCompare(compare)
  })

  await server.register(import('./route.mjs'))
  await server.register(import('./database.mjs'), opts.database !== undefined ? opts.database : { database: 'dev.sqlite' })
  await server.register(import('./authentication/plugin.mjs'), { prefix: 'authentication' })

  return server
}
