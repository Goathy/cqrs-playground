import { register } from './functions.mjs'
import { registerSchema } from './schema.mjs'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function (app) {
  app.post('/register', {
    schema: {
      description: 'Register account',
      tags: ['authentication'],
      body: registerSchema,
      response: {
        201: {}
      }
    }
  }, async (req, reply) => {
    await register(app, req.body)

    await reply.code(201).send()
  })
}
