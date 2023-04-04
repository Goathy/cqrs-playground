'use strict'

import createUserCommand from './commands/create-user.command.mjs'
import getUserByEmailQuery from './queries/get-user-by-email.query.mjs'
import { createUserSchema } from './schemas/create-user.schema.mjs'

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
        },
        400: {
          description: 'bad request',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        409: {
          description: 'conflict',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
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
