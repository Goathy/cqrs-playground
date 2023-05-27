'use strict'

import { test } from 'tap'
import { buildServer } from '../src/server.mjs'
import { IN_MEMORY, sql } from '@databases/sqlite'
import { prepare } from './util/prepare-database.mjs'
import UUID_REGEX from './util/uuid.mjs'

test('create user', { only: true }, async ({ plan, teardown, equal, same, ok }) => {
  plan(4)

  const app = buildServer()
  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/crypto/crypto.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))

  await prepare(app.db)

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

  const [{ id, password, ...user }] = await app.db.query(sql`SELECT * FROM users`)

  ok(typeof id === 'string' && id.length === 36)
  ok(typeof password === 'string' && password.length === 60)
  same(user, {
    email: 'joe.doe@mail.co',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('create user | user already exists', async ({ plan, teardown, equal, match }) => {
  plan(3)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

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

  equal(response.json().code, 'USER_ALREADY_REGISTERED')
  match(response.json().message, new RegExp(`user with id=${UUID_REGEX} is already registered`))
})

test('create user | missing required field', async ({ plan, teardown, equal }) => {
  plan(10)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

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

test('create user | passwords does not match', async ({ plan, teardown, equal, same }) => {
  plan(2)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

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

test('login | user does not exists', async ({ plan, teardown, equal, same }) => {
  plan(2)
  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

  const response = await app.inject({
    method: 'POST',
    url: '/login',
    payload: {
      email: 'joe.doe@mail.co',
      password: 'p4ssw0rd!1'
    }
  })

  equal(response.statusCode, 404)
  same(response.json(), {
    message: 'user not found',
    code: 'USER_NOT_FOUND'
  })
})

test('login | password does not match', async ({ plan, teardown, equal, same }) => {
  plan(3)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

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

    equal(response.statusCode, 201)
  }

  const response = await app.inject({
    method: 'POST',
    url: '/login',
    payload: {
      email: user.email,
      password: 'password11'
    }
  })

  equal(response.statusCode, 400)
  same(response.json(), {
    message: 'wrong password',
    code: 'WRONG_PASSWORD'
  })
})

test('login | establish session', async ({ plan, teardown, equal, hasProp }) => {
  plan(3)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

  const user = {
    email: 'joe.doe@mail.co',
    password: 'p4ssw0rd!1',
    confirmPassword: 'p4ssw0rd!1',
    firstName: 'Joe',
    lastName: 'Doe'
  }

  app.get('/test', async (request) => {
    equal(request.session.get('email'), user.email)

    return {}
  })

  {
    const response = await app.inject({
      url: '/register',
      method: 'POST',
      payload: user
    })

    equal(response.statusCode, 201)
  }

  let cookie
  {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'joe.doe@mail.co',
        password: 'p4ssw0rd!1'
      },
      headers: {
        'x-forwarded-proto': 'https'
      }
    })

    hasProp(response.headers, 'set-cookie')

    cookie = response.headers['set-cookie']
  }

  await app.inject({
    method: 'GET',
    url: '/test',
    headers: {
      'x-forwarded-proto': 'https',
      cookie
    }
  })
})

test('session shouldn\'t be established when asking endpoint', async ({ plan, teardown, pass }) => {
  plan(1)

  const app = buildServer()

  teardown(() => app.close())

  await app.register(import('../src/database.mjs'), { database: IN_MEMORY })
  await app.register(import('../src/common/errors/error.handler.mjs'))
  await app.register(import('../src/authentication/authentication.mjs'))
  await app.register(import('../src/common/crypto/crypto.mjs'))

  await prepare(app.db)

  app.get('/test', async () => {
    return {}
  })

  const response = await app.inject({
    method: 'GET',
    url: '/test',
    headers: {
      'x-forwarded-proto': 'https'
    }
  })

  if (response.headers['set-cookie'] === undefined) {
    pass()
  }
})
