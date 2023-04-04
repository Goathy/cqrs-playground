import { sql } from '@databases/sqlite'
import { randomUUID as uid } from 'node:crypto'
import { createUser } from '../create-user.mjs'

export async function createUserCommand (db, body) {
  await db.tx(async (tx) => {
    const { email, password, firstName, lastName } = await createUser(body)
    await tx.query(sql`
        INSERT INTO users (id, email, password, first_name, last_name)
        VALUES (${uid()}, ${email}, ${password}, ${firstName}, ${lastName})
        `)
  })
}

export default createUserCommand
