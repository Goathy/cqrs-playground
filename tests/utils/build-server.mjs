'use strict'

import fastify from 'fastify'

export async function buildTestServer (pluginsList) {
  const server = fastify()

  for (const [plugin, opts] of pluginsList) {
    await server.register(plugin, opts)
  }

  return server
}
