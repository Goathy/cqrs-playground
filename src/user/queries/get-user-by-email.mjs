'use strict'

import { sql } from '@databases/sqlite'

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {string} email
 */
export async function getUserByEmail (app, email) {
  const [user] = await app.db.tx(async (tx) => {
    return await tx.query(sql`
        SELECT id,
            email,
            password,
            first_name AS firstName,
            last_name AS lastName
        FROM users AS u
        WHERE u.email = ${email}
`)
  })

  return user
}
