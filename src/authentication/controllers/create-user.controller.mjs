'use strict'

import { createUserHandler } from '../commands/handlers/create-user.handler.mjs'
import { createUserCommand } from '../commands/implementations/create-user.command.mjs'
import { createUserSchema } from '../schemas/create-user.schema.mjs'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function (app) {
  app.post('/register', {
    schema: {
      description: 'Register account',
      tags: ['authentication'],
      body: createUserSchema,
      response: {
        201: {
          description: 'user account sucessfully created',
          type: 'object',
          properties: {}
        }
        // ,
        // 400: {
        //   description: 'bad request',
        //   type: 'object',
        //   properties: {
        //     statusCode: { type: 'number' },
        //     error: { type: 'string' },
        //     message: { type: 'string' }
        //   }
        // },
        // 409: {
        //   description: 'conflict',
        //   type: 'object',
        //   properties: {
        //     statusCode: { type: 'number' },
        //     error: { type: 'string' },
        //     message: { type: 'string' }
        //   }
        // }
      }
    }
  }, async (req, reply) => {
    const command = createUserCommand(req.body)
    await createUserHandler(app, command)

    return reply.code(201).send()
  })
}
