'use strict'

import fp from 'fastify-plugin'
import { errorSchema } from './../common/errors/schema.mjs'
import { registerUserSchema } from './authentication.schema.mjs'
import { createUserHandler } from './commands/handlers/create-user.handler.mjs'
import { createUserCommand } from './commands/implementations/create-user.command.mjs'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default fp(async function (app) {
  app.post('/register', {
    schema: {
      description: 'Register user account',
      tags: ['authentication'],
      body: registerUserSchema,
      response: {
        201: {
          description: 'user account successfully created',
          type: 'object',
          properties: {}
        },
        400: errorSchema
      }
    }
  }, async (req, reply) => {
    const command = createUserCommand(req.body)
    await createUserHandler(app, command)

    return reply.code(201).send()
  })
})
