'use strict'

import { test } from 'tap'
import PASSWORD_REGEX from '../../../tests/utils/password.mjs'
import { createUser } from './create-user.mjs'
import fastify from 'fastify'

test('create user object', async ({ teardown, plan, same, match }) => {
  plan(2)

  const app = fastify()

  teardown(async () => { await app.close() })

  await app.register(import('../../common/crypto.mjs'))

  const input = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const { password: gotPassword, ...got } = await createUser(app, input)

  match(gotPassword, PASSWORD_REGEX, 'incorrect password format')
  same(got, {
    email: 'joe.doe@mail.co',
    firstName: 'Joe',
    lastName: 'Doe'
  }, 'user object do not match with expected value')
})
