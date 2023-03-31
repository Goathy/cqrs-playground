import { test } from 'tap'
import fastify from 'fastify'

test('happy path', async (t) => {
  t.plan(2)

  const server = fastify()

  await server.register(import('./route.mjs'))

  const response = await server.inject({ method: 'GET', url: '/happy' })

  t.equal(response.statusCode, 200, 'status code should be 200')
  t.equal(response.body, 'Happy Path :D')
})
