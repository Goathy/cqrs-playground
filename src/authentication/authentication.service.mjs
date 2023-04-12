'use strict'
import { sql } from '@databases/sqlite'

async function register ({ db, crypto }, user) {
  const salt = await crypto.genSalt(10, 'b')
  const hash = await crypto.genHash(user.password, salt)

  await db.query(sql`INSERT INTO users VALUES (${crypto.uuid()}, ${user.email}, ${hash}, ${user.firstName}, ${user.lastName})`)
}

export default { register }
