'use strict'

import { IN_MEMORY, sql } from '@databases/sqlite'
import { test } from 'tap'
import { buildTestServer } from '../util/build-server.mjs'
import { prepare } from '../util/prepare-database.mjs'

test('register', async (t) => {
  t.plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

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

  t.equal(response.statusCode, 201, 'user account created')

  const [user] = await app.db.query(sql`SELECT * FROM users`)

  t.same(user, {
    id: 'b9f310bc-bd77-4734-ad91-6b6b8b490665',
    email: 'joe.doe@mail.co',
    password: '$2b$10$7NPc/v6RLP.vMpnHw17.FuskK8dspB/WzXEs45lBREVGXvUykbf.e',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('register | user already exists', async (t) => {
  t.plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

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

  t.equal(response.statusCode, 400, 'user already exists')

  t.same(response.json(), {
    code: 'USER_ALREADY_REGISTERED',
    message: 'user with id=b9f310bc-bd77-4734-ad91-6b6b8b490665 is already registered'
  })
})

test('register | missing required field', async (t) => {
  t.plan(10)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

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

    t.equal(response.statusCode, 400, "missing 'email' property")

    t.equal(response.json().message, "body must have required property 'email'", 'error message')
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

    t.equal(response.statusCode, 400, "missing 'password' property")

    t.equal(response.json().message, "body must have required property 'password'", 'error message')
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

    t.equal(response.statusCode, 400, "missing 'confirmPassword' property")

    t.equal(response.json().message, "body must have required property 'confirmPassword'", 'error message')
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

    t.equal(response.statusCode, 400, "missing 'firstName' property")

    t.equal(response.json().message, "body must have required property 'firstName'", 'error message')
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

    t.equal(response.statusCode, 400, "missing 'lastName' property")

    t.equal(response.json().message, "body must have required property 'lastName'", 'error message')
  }
})

test('register | passwords does not match', async (t) => {
  t.plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

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

  t.equal(response.statusCode, 400, "'password' and 'confirmPassword' vary")

  t.same(response.json(), {
    message: "'password' and 'confirmPassword' vary",
    code: 'PASSWORDS_VARY'
  })
})

test('login | user does not exists', async (t) => {
  t.plan(2)

  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

  const response = await app.inject({
    method: 'POST',
    url: '/login',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1'
    }
  })

  t.equal(response.statusCode, 404)
  t.same(response.json(), {
    message: 'user not found',
    code: 'USER_NOT_FOUND'
  })
})

test('login | password does not match', async (t) => {
  t.plan(3)
  const app = await buildTestServer([
    [import('../../src/database.mjs'), { database: IN_MEMORY }],
    [import('../../src/common/errors/error.handler.mjs')],
    [import('../../src/authentication/plugin.mjs')],
    [import('../util/crypto.mjs')]
  ])

  await prepare(app.db)

  t.teardown(() => app.close())

  const user = {
    email: 'joe.doe@mail.co',
    password: 'p4ssw0rd!1',
    confirmPassword: 'p4ssw0rd!1',
    firstName: 'Joe',
    lastName: 'Doe'

  }
  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: user
    })

    t.equal(response.statusCode, 201)
  }

  const response = await app.inject({
    method: 'POST',
    url: '/login',
    payload: {
      email: user.email,
      password: 'password11'
    }
  })

  t.equal(response.statusCode, 400)
  t.same(response.json(), {
    message: 'wrong password',
    code: 'WRONG_PASSWORD'
  })
})

test('login', async (t) => {})
