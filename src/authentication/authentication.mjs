'use strict'

import fp from 'fastify-plugin'
import { createUser } from '../user/commands/create-user.mjs'
import { getUserByEmail } from '../user/queries/get-user-by-email.mjs'
import { UserNotFoundError } from '../user/user.errors.mjs'
import { errorSchema } from './../common/errors/schema.mjs'
import { WrongPasswordError } from './authentication.errors.mjs'
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

  app.route({
    method: 'POST',
    url: '/login',
    schema: {},
    async handler (request) {
      const { email, password } = request.body

      const user = await getUserByEmail(app, email)

      if (user === undefined) {
        throw new UserNotFoundError()
      }

      // console.log('user: ', user)
      // console.log('passwd:', password)

      const equals = await app.crypto.compare(user.password, password)

      if (equals === false) {
        throw new WrongPasswordError()
      }
    }
  })
})
