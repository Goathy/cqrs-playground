'use strict'

import { sql } from '@databases/sqlite'
import { afterEach, beforeEach, test } from 'tap'
import { buildTestServer } from '../utils/build-server.mjs'
import PASSWORD_REGEX from '../utils/password.mjs'
import { TEST_DATABASE, clean, prepare } from '../utils/prepare-database.mjs'

beforeEach(async () => { await prepare() })

afterEach(async () => { await clean() })

test('create user', async ({ teardown, plan, equal, same, match }) => {
  plan(3)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: TEST_DATABASE }],
    [import('../../src/authentication/plugin.mjs')],
    [import('../utils/crypto.mjs')]
  ])

  teardown(() => app.close())

  const response = await app.inject({
    url: '/register',
    method: 'POST',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1',
      confirmPassword: 'p4ssw0rd!1',
      firstName: 'Joe',
      lastName: 'Doe'
    }
  })

  equal(response.statusCode, 201, 'user account created')

  const [{ password, ...user }] = await app.db.query(sql`SELECT * FROM users`)

  match(password, PASSWORD_REGEX, 'incorrect password format')

  same(user, {
    id: 'b9f310bc-bd77-4734-ad91-6b6b8b490665',
    email: 'joe.doe@mail.co',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('create user | user already exists', async ({ teardown, plan, equal, same }) => {
  plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: TEST_DATABASE }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../utils/crypto.mjs')]
  ])

  teardown(() => app.close())

  await app.inject({
    url: '/register',
    method: 'POST',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1',
      confirmPassword: 'p4ssw0rd!1',
      firstName: 'Joe',
      lastName: 'Doe'
    }
  })

  const response = await app.inject({
    url: '/register',
    method: 'POST',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1',
      confirmPassword: 'p4ssw0rd!1',
      firstName: 'Joe',
      lastName: 'Doe'
    }
  })

  equal(response.statusCode, 400, 'user already exists')

  same(response.json(), {
    code: 'USER_ALREADY_REGISTERED',
    message: 'user with id=b9f310bc-bd77-4734-ad91-6b6b8b490665 is already registered'
  })
})

test('create user | missing required field', async ({ teardown, plan, equal }) => {
  plan(10)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: TEST_DATABASE }],
    [import('../../src/authentication/plugin.mjs')],
    [import('../utils/crypto.mjs')]
  ])

  teardown(() => app.close())

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: {
        password: 'p4ssw0rd!1',
        confirmPassword: 'p4ssw0rd!1',
        firstName: 'Joe',
        lastName: 'Doe'
      }
    })

    equal(response.statusCode, 400, "missing 'email' property")

    equal(response.json().message, "body must have required property 'email'", 'error message')
  }

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: {
        email: 'joe.doe@mail.co',
        confirmPassword: 'p4ssw0rd!1',
        firstName: 'Joe',
        lastName: 'Doe'
      }
    })

    equal(response.statusCode, 400, "missing 'password' property")

    equal(response.json().message, "body must have required property 'password'", 'error message')
  }

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: {
        email: 'joe.doe@mail.co',
        password: 'p4ssw0rd!1',
        firstName: 'Joe',
        lastName: 'Doe'
      }
    })

    equal(response.statusCode, 400, "missing 'confirmPassword' property")

    equal(response.json().message, "body must have required property 'confirmPassword'", 'error message')
  }

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: {
        email: 'joe.doe@mail.co',
        password: 'p4ssw0rd!1',
        confirmPassword: 'p4ssw0rd!1',
        lastName: 'Doe'
      }
    })

    equal(response.statusCode, 400, "missing 'firstName' property")

    equal(response.json().message, "body must have required property 'firstName'", 'error message')
  }

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: {
        email: 'joe.doe@mail.co',
        password: 'p4ssw0rd!1',
        confirmPassword: 'p4ssw0rd!1',
        firstName: 'Joe'
      }
    })

    equal(response.statusCode, 400, "missing 'lastName' property")

    equal(response.json().message, "body must have required property 'lastName'", 'error message')
  }
})

test('create user | passwords does not match', async ({ teardown, plan, equal, same }) => {
  plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: TEST_DATABASE }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../utils/crypto.mjs')]
  ])

  teardown(() => app.close())

  const response = await app.inject({
    url: '/register',
    method: 'POST',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1',
      confirmPassword: 'p4ssw0rd!11',
      firstName: 'Joe',
      lastName: 'Doe'
    }
  })

  equal(response.statusCode, 400, "'password' and 'confirmPassword' vary")

  same(response.json(), {
    message: "'password' and 'confirmPassword' vary",
    code: 'PASSWORDS_VARY'
  })
})
