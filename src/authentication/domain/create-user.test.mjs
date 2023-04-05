'use strict'

import { test } from 'tap'
import { createUser } from './create-user.mjs'
import PASSWORD_REGEX from '../../../tests/utils/password.mjs'

test('create user object', async ({ plan, same, match }) => {
  plan(2)

  const input = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const { password: gotPassword, ...got } = await createUser(input)

  match(gotPassword, PASSWORD_REGEX, 'incorrect password format')
  same(got, {
    email: 'joe.doe@mail.co',
    firstName: 'Joe',
    lastName: 'Doe'
  }, 'user object do not match with expected value')
})
