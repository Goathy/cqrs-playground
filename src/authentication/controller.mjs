import { createUser } from './create-user.mjs'
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
    },
    preHandler: async (req, reply) => {
      const { password, confirmPassword } = req.body
      // TODO: Check if customer already exist

      if (password !== confirmPassword) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'body/password and body/confirmPassword must match each others'
        })
      }
    }
  }, async (req, reply) => {
    // TODO: Use postgrator to run migration during tests https://github.com/rickbergfalk/postgrator
    /* const user = */ await createUser(req.body)
    return reply.code(201).send()
  })
}
