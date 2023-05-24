'use strict'

import { sql } from '@databases/sqlite'
import { PasswordsVaryError, UserRegisteredError } from '../../authentication/authentication.errors.mjs'
import { getUserByEmail } from '../queries/get-user-by-email.mjs'

/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} password
 * @property {string} confirmPassword
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {User} user
 */
export async function createUser (app, user) {
  const { crypto, db } = app
  const { email, password, confirmPassword, firstName, lastName } = user

  const exists = await getUserByEmail(app, email)

  if (exists !== undefined) {
    throw new UserRegisteredError(exists.id)
  }

  if (password !== confirmPassword) {
    throw new PasswordsVaryError()
  }

  const salt = await crypto.salt()

  const hash = await crypto.hash(password, salt)

  await db.tx(async (tx) => await tx.query(sql`
        INSERT INTO users (id, email, password, first_name, last_name)
        VALUES (${crypto.uuid()}, ${email}, ${hash}, ${firstName}, ${lastName})
        `))
}
