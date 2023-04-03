import fastify from 'fastify'
import process from 'node:process'

const server = fastify({ logger: true })

await server.register(import('@fastify/swagger'))
await server.register(import('@fastify/swagger-ui'), {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full'
  }
})

await server.register(import('./route.mjs'))
await server.register(import('./database.mjs'), { database: 'dev.sqlite' })
await server.register(import('./authentication/controller.mjs'))

await server.listen({ port: 3000, host: '0.0.0.0' })

;['SIGINT', 'SIGTERM']
  .forEach((signal) =>
    process.once(signal,
      async () => await server.close()))
