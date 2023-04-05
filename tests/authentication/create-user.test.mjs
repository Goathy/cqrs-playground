'use strict'

import { sql } from '@databases/sqlite'
import { afterEach, beforeEach, test } from 'tap'
import { buildServer } from '../utils/build-server.mjs'
import PASSWORD_REGEX from '../utils/password.mjs'
import { clean, prepare } from '../utils/prepare-database.mjs'
import UUID_REGEX from '../utils/uuid.mjs'

beforeEach(async () => { await prepare() })

afterEach(async () => { await clean() })

test('create user', async ({ teardown, plan, equal, same, match }) => {
  plan(4)

  const app = await buildServer()

  teardown(() => app.close())

  await app.register(import('../../src/authentication/plugin.mjs'))

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

  match(id, UUID_REGEX, 'expect uuid format')
  match(password, PASSWORD_REGEX, 'incorrect password format')
  same(user, {
    email: 'joe.doe@mail.co',
    first_name: 'Joe',
    last_name: 'Doe'
  })
})

test('create user | user already exists', async ({ teardown, plan, equal }) => {
  plan(1)

  const app = await buildServer()

  teardown(() => app.close())

  await app.register(import('../../src/authentication/plugin.mjs'))

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

  equal(response.statusCode, 409, 'user already exist')
})

test('create user | missing required field', async ({ teardown, plan, equal }) => {
  plan(10)

  const app = await buildServer()

  teardown(() => app.close())

  await app.register(import('../../src/authentication/plugin.mjs'))

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

test('create user | passwords does not match', async ({ teardown, plan, equal }) => {
  plan(2)

  const app = await buildServer()

  teardown(() => app.close())

  await app.register(import('../../src/authentication/plugin.mjs'))

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

  equal(response.statusCode, 400, "'password' and 'confirmPassword' do not match")
  equal(response.json().message, "body properties 'password' and 'confirmPassword' do not match with each others", 'error message')
})
