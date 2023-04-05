'use strict'

import { createUser } from '../../domain/create-user.mjs'
import { sql } from '@databases/sqlite'
import { randomUUID as uid } from 'node:crypto'
import { CreateUserCommand } from '../implementations/create-user.command.mjs'

export async function createUserHandler (db, command) {
  if (command instanceof CreateUserCommand === false) {
    throw new Error('invalid command')
  }

  await db.tx(async (tx) => {
    const { email, password, firstName, lastName } = await createUser(command)
    await tx.query(sql`
        INSERT INTO users (id, email, password, first_name, last_name)
        VALUES (${uid()}, ${email}, ${password}, ${firstName}, ${lastName})
        `)
  })
}
