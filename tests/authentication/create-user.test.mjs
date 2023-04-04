'use strict'

import { sql } from '@databases/sqlite'
import { unlink } from 'fs/promises'
import { test, beforeEach, afterEach } from 'tap'
import { buildServer } from '../utils/build-server.mjs'
import UUID_REGEX from '../utils/uuid.mjs'
import PASSWORD_REGEX from '../utils/password.mjs'
import { runMigration, TEST_DATABASE } from '../utils/migration.mjs'

beforeEach(async () => { await runMigration() })

afterEach(async () => { await unlink(TEST_DATABASE) })

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

  equal(response.statusCode, 201, 'succesfully created user account')

  const [{ id, password, ...user }] = await app.db.query(sql`SELECT * FROM users`)

  match(id, UUID_REGEX, 'id should be in uuid v4 format')
  match(password, PASSWORD_REGEX, 'password do not match specified shape')
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
