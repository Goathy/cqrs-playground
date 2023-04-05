'use strict'

import { createUserHandler } from '../commands/handlers/create-user.handler.mjs'
import { createUserCommand } from '../commands/implementations/create-user.command.mjs'
import { createUserSchema } from '../schemas/create-user.schema.mjs'
import { getUserByEmailQuery } from '../queries/implementations/get-user-by-email.query.mjs'
import { getUserByEmailHandler } from '../queries/handlers/get-user-by-email.handler.mjs'

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

      const query = getUserByEmailQuery(email)
      const exists = await getUserByEmailHandler(app.db, query)

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
          message: "body properties 'password' and 'confirmPassword' do not match with each others"
        })
      }
    }
  }, async (req, reply) => {
    const command = createUserCommand(req.body)
    await createUserHandler(app.db, command)

    return reply.code(201).send()
  })
}
