import { test } from 'tap'
import { createUser } from './functions.mjs'

test('createUser', async ({ plan, same, match }) => {
  plan(2)

  const input = { email: 'joe.doe@mail.co', password: 'p4ssw0rd1!', firstName: 'Joe', lastName: 'Doe' }

  const { password: gotPassword, ...got } = await createUser(input)

  match(gotPassword, /^[0-9a-z]{16}:[0-9a-z]{64}$/, 'password do not match specified shape')
  same(got, {
    email: 'joe.doe@mail.co',
    firstName: 'Joe',
    lastName: 'Doe'
  }, 'user object do not match with expected value')
})
