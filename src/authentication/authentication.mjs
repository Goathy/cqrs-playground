'use strict'

import fp from 'fastify-plugin'
import { createUser } from '../user/commands/create-user.mjs'
import { errorSchema } from './../common/errors/schema.mjs'
import { registerUserSchema } from './authentication.schema.mjs'

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
  }, async (request, reply) => {
    await createUser(app, request.body)

    return reply.code(201).send({})
  })
})
