'use strict'

import { sql } from '@databases/sqlite'
import { test } from 'tap'
import PASSWORD_REGEX from '../../../../tests/utils/password.mjs'
import { clean, prepare } from '../../../../tests/utils/prepare-database.mjs'
import UUID_REGEX from '../../../../tests/utils/uuid.mjs'
import { PasswordsVaryError, UserRegisteredError } from '../../errors/authentication.errors.mjs'
import { createUserCommand } from '../implementations/create-user.command.mjs'
import { createUserHandler } from './create-user.handler.mjs'

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

  match(id, UUID_REGEX, 'expect uuid format')
  match(password, PASSWORD_REGEX, 'incorrect password format')
  same(user, {
    email: 'joe.doe@mail.co',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('create user | invalid command', async ({ teardown, plan, equal }) => {
  plan(1)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  try {
    await createUserHandler(db, body)
  } catch (error) {
    equal('invalid command', error.message, 'error message should match')
  }
})

test('create user | user already exists', async ({ teardown, plan, equal }) => {
  plan(1)
  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const command = createUserCommand(body)

  await createUserHandler(db, command)

  try {
    await createUserHandler(db, command)
  } catch (error) {
    equal(error instanceof UserRegisteredError, true, 'error should be an instance of UserNotFoundError')
  }
})

test('create user | passwords do not match', async ({ teardown, plan, equal }) => {
  plan(1)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'password!!', firstName: 'Joe', lastName: 'Doe' }

  const command = createUserCommand(body)

  try {
    await createUserHandler(db, command)
  } catch (error) {
    equal(error instanceof PasswordsVaryError, true, 'error should be an instance of PasswordsVaryError')
  }
})
