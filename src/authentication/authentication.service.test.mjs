'use strict'

import { test } from 'tap'
import authentication from './authentication.service.mjs'
import { clean, prepare } from '../../tests/utils/prepare-database.mjs'
import { sql } from '@databases/sqlite'
import bcrypt from 'bcrypt'

test('register user', async (t) => {
  t.plan(3)

  const cryptoMock = {
    uuid: () => 'b9f310bc-bd77-4734-ad91-6b6b8b490665',
    genSalt: bcrypt.genSalt,
    genHash: bcrypt.hash,
    compare: bcrypt.compare
  }

  const db = await prepare()

  t.teardown(async () => {
    await db.dispose()
    await clean()
  })

  const user = {
    email: 'joe.doe@mail.co',
    password: 'p4ssw0rd!1',
    firstName: 'Joe',
    lastName: 'Doe'
  }

  await authentication.register({ db, crypto: cryptoMock }, user)

  const [{ id, password, ...userToCompare }] = await db.query(sql`SELECT id, email, password, first_name AS firstName, last_name AS lastName FROM users`)

  const equal = await cryptoMock.compare(user.password, password)

  delete user.password

  t.ok(equal)
  t.equal(id, 'b9f310bc-bd77-4734-ad91-6b6b8b490665')
  t.same(userToCompare, user)
})
