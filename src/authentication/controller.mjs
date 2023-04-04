'use strict'

import createUserCommand from './commands/create-user.command.mjs'
import getUserByEmailQuery from './queries/get-user-by-email.query.mjs'
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
      const { password, confirmPassword, email } = req.body

      const exists = await getUserByEmailQuery(app.db, email)

      if (exists !== undefined) {
        return reply.code(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'cannot create user account'
        })
      }

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

    await createUserCommand(app.db, req.body)
    return reply.code(201).send()
  })
}
