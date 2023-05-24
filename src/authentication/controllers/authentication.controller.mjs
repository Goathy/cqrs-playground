'use strict'

import { errorSchema } from '../../common/errors/schema.mjs'
import { createUserHandler } from '../commands/handlers/create-user.handler.mjs'
import { createUserCommand } from '../commands/implementations/create-user.command.mjs'
import { createUserSchema } from '../schemas/create-user.schema.mjs'
import { UserNotFoundError, WrongPasswordError } from '../errors/authentication.errors.mjs'
import { getUserByEmailQuery } from '../queries/implementations/get-user-by-email.query.mjs'
import { getUserByEmailHandler } from '../queries/handlers/get-user-by-email.handler.mjs'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function (app) {
  app.route({
    method: 'POST',
    url: '/register',
    schema: {
      description: 'Register account',
      tags: ['authentication'],
      body: createUserSchema,
      response: {
        201: {
          description: 'user account successfully created',
          type: 'object',
          properties: {}
        },
        400: errorSchema
      }
    },
    async handler (req, reply) {
      const command = createUserCommand(req.body)
      await createUserHandler(app, command)

      return reply.code(201).send()
    }
  })

  app.route({
    method: 'POST',
    url: '/login',
    schema: {},
    async handler (req, reply) {
      const { email, password } = req.body

      const query = getUserByEmailQuery(email)

      const user = await getUserByEmailHandler(app, query)

      if (user === undefined) {
        throw new UserNotFoundError()
      }

      const equals = await app.crypto.compare(user.password, password)

      if (equals === false) {
        throw new WrongPasswordError()
      }
    }
  })
}
