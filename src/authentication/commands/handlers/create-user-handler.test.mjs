'use strict'

import { sql } from '@databases/sqlite'
import { test } from 'tap'
import { clean, prepare } from '../../../../tests/utils/migration.mjs'
import { createUserCommand } from '../implementations/create-user.command.mjs'
import { createUserHandler } from './create-user.handler.mjs'
import UUID_REGEX from '../../../../tests/utils/uuid.mjs'
import PASSWORD_REGEX from '../../../../tests/utils/password.mjs'

test('create user', async ({ teardown, plan, match, same }) => {
  plan(3)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const command = createUserCommand(body)

  await createUserHandler(db, command)

  const [{ id, password, ...user }] = await db.query(sql`SELECT * FROM users`)

  match(id, UUID_REGEX, 'id should be in uuid v4 format')
  match(password, PASSWORD_REGEX, 'password do not match specified shape')
  same(user, {
    email: 'joe.doe@mail.co',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('create user | invalid command', async ({ teardown, plan, pass, fail }) => {
  plan(1)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  try {
    await createUserHandler(db, body)
    fail('should throw error')
  } catch (error) {
    if (error instanceof Error) {
      pass('should throw an error')
    } else {
      fail('should throw error')
    }
  }
})
