'use strict'

import { sql } from '@databases/sqlite'
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
  if (command instanceof CreateUserCommand === false) {
    throw new Error('invalid command')
  }

  const { crypto, db } = app
  const { email, password, confirmPassword, firstName, lastName } = command

  const user = await getUserByEmailHandler(
    app,
    getUserByEmailQuery(email)
  )

  if (user !== undefined) {
    throw new UserRegisteredError(user.id)
  }

  if (password !== confirmPassword) {
    throw new PasswordsVaryError()
  }

  await db.tx(async (tx) => {
    const salt = await crypto.genSalt()

    const hash = await crypto.genHash(password, salt)

    await tx.query(sql`
        INSERT INTO users (id, email, password, first_name, last_name)
        VALUES (${crypto.uuid()}, ${email}, ${hash}, ${firstName}, ${lastName})
        `)
  })
}
