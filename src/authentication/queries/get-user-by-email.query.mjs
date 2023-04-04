'use strict'

import { sql } from '@databases/sqlite'

export async function getUserByEmailQuery (db, email) {
  const [user] = await db.tx(async (tx) => {
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

  console.log('debug: ', user)

  return {}
}

export default getUserByEmailQuery
