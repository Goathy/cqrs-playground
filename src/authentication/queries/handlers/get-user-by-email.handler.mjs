'use strict'

import { sql } from '@databases/sqlite'
import { GetUserByEmailQuery } from '../implementations/get-user-by-email.query.mjs'

export async function getUserByEmailHandler (db, query) {
  if (query instanceof GetUserByEmailQuery === false) {
    throw new Error('invalid query')
  }

  const [user] = await db.tx(async (tx) => {
    return await tx.query(sql`
        SELECT id,
            email,
            password,
            first_name AS firstName,
            last_name AS lastName
        FROM users AS u
        WHERE u.email = ${query.email}
`)
  })

  return user
}
