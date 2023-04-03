import { sql } from '@databases/sqlite'
import { randomUUID as uuid } from 'node:crypto'
export async function register ({ db }, { email, password, firstName, lastName }) {
  await db.tx(async (tx) => {
    await tx.query(sql`
    INSERT INTO users (id, email, password, first_name, last_name) 
    VALUES (${uuid()}, ${email}, ${password.toString('hex')}, ${firstName}, ${lastName})`)
  })
}
