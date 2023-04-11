'use strict'

import { sql } from '@databases/sqlite'
import { createUser } from '../../domain/create-user.mjs'
import { PasswordsVaryError, UserRegisteredError } from '../../errors/authentication.errors.mjs'
import { getUserByEmailHandler } from '../../queries/handlers/get-user-by-email.handler.mjs'
import { getUserByEmailQuery } from '../../queries/implementations/get-user-by-email.query.mjs'
import { CreateUserCommand } from '../implementations/create-user.command.mjs'

/**
 *
 * @param {import('fastify').FastifyInstance} app
 * @param {import('../implementations/create-user.command.mjs').CreateUserCommand} command
 */
export async function createUserHandler (app, command) {
  const { crypto: { uuid }, db } = app

  if (command instanceof CreateUserCommand === false) {
    throw new Error('invalid command')
  }

  const user = await getUserByEmailHandler(
    app,
    getUserByEmailQuery(command.email)
  )

  if (user !== undefined) {
    throw new UserRegisteredError(user.id)
  }

  if (command.password !== command.confirmPassword) {
    throw new PasswordsVaryError()
  }

  await db.tx(async (tx) => {
    const { email, password, firstName, lastName } = await createUser(app, command)
    await tx.query(sql`
          INSERT INTO users (id, email, password, first_name, last_name)
          VALUES (${uuid()}, ${email}, ${password}, ${firstName}, ${lastName})
          `)
  })
}
