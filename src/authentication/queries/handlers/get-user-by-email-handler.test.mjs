'use strict'

import { test } from 'tap'
import { clean, prepare } from '../../../../tests/utils/prepare-database.mjs'
import PASSWORD_REGEX from '../../../../tests/utils/password.mjs'
import UUID_REGEX from '../../../../tests/utils/uuid.mjs'
import { createUserCommand } from '../../commands/implementations/create-user.command.mjs'
import { getUserByEmailQuery } from '../implementations/get-user-by-email.query.mjs'
import { createUserHandler } from '../../commands/handlers/create-user.handler.mjs'
import { getUserByEmailHandler } from './get-user-by-email.handler.mjs'

test('get user', async ({ teardown, plan, match, same }) => {
  plan(3)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const body = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', confirmPassword: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const command = createUserCommand(body)

  await createUserHandler(db, command)

  const query = getUserByEmailQuery('joe.doe@mail.co')

  const { id, password, ...user } = await getUserByEmailHandler(db, query)

  match(id, UUID_REGEX, 'id should be in uuid v4 format')
  match(password, PASSWORD_REGEX, 'password do not match specified shape')
  same(user, {
    email: 'joe.doe@mail.co',
    firstName: 'Joe',
    lastName: 'Doe'
  })
})

test('get user | invalid command', async ({ teardown, plan, equal }) => {
  plan(1)

  const db = await prepare()

  teardown(async () => {
    await db.dispose()
    await clean()
  })

  const query = { email: 'joe.doe@mail.co' }
  try {
    await getUserByEmailHandler(db, query)
  } catch (error) {
    equal('invalid query', error.message, 'error message should match')
  }
})
