'use strict'

import { test } from 'tap'
import { CryptoBuilder } from './crypto.mjs'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import uuidRegex from '../../../tests/utils/uuid.mjs'
import { createHash as hash } from 'node:crypto'

test('compare', async (t) => {
  t.plan(1)

  const compareMock = () => true

  const crypto = new CryptoBuilder().setCompare(compareMock).build()

  const equal = await crypto.compare()

  t.ok(equal)
})

test('compare | provide custom implementation', async (t) => {
  t.plan(2)
  const testHash = '$2b$10$JOmQqw9FTiPnTfjdrO9PdOxLD1LXN.aE8lJ/.8YCKJgTzqUUAG0wS'
  const testPassword = 'p4ssw0rd!1'
  {
    function customCompare (password, hash) {
      return bcrypt.compare(password, hash)
    }

    const crypto = new CryptoBuilder().setCompare(customCompare).build()
    const match = await crypto.compare(testPassword, testHash)

    t.ok(match)
  }

  {
    class TestError extends Error {
      constructor () {
        super('should throw')
      }
    }

    async function customCompare (password, hash) {
      await Promise.reject(new TestError())
    }

    try {
      const crypto = new CryptoBuilder().setCompare(customCompare).build()
      await crypto.compare(testPassword, testHash)
    } catch (error) {
      t.equal(error.message, 'should throw')
    }
  }
})

test('compare | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setCompare('').build()
  } catch (error) {
    t.pass()
  }
})

test('genUUID', async (t) => {
  t.plan(1)

  const uuidGenMock = () => '9dd0de4a-70cd-4c83-91cc-1f1a369e006a'

  const crypto = new CryptoBuilder().setUUID(uuidGenMock).build()

  const uuid = '9dd0de4a-70cd-4c83-91cc-1f1a369e006a'

  t.equal(crypto.uuid(), uuid)
})

test('genUUID | provide custom implementation', async (t) => {
  t.plan(1)

  function customUUID () {
    return randomUUID()
  }

  const crypto = new CryptoBuilder().setUUID(customUUID).build()

  const uuid = crypto.uuid()

  t.match(uuid, uuidRegex)
})

test('genUUID | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setUUID('').build()
  } catch (error) {
    t.pass()
  }
})

test('genSalt', async (t) => {
  t.plan(1)

  const saltGenMock = () => 'test_salt'

  const crypto = new CryptoBuilder().setSalt(saltGenMock).build()

  const salt = crypto.genSalt()

  t.equal(salt, 'test_salt')
})

test('genSalt | provide custom implementation', async (t) => {
  t.plan(2)

  {
    function customSalt () {
      return bcrypt.genSalt()
    }

    const crypto = new CryptoBuilder().setSalt(customSalt).build()

    const salt = await crypto.genSalt()

    t.match(salt, /^\$2b\$10\$/)
  }

  {
    class TestError extends Error {
      constructor () {
        super('should throw')
      }
    }

    async function customSalt () {
      await Promise.reject(new TestError())
    }

    try {
      const crypto = new CryptoBuilder().setSalt(customSalt).build()

      await crypto.genSalt()
    } catch (error) {
      t.same(error.message, 'should throw')
    }
  }
})

test('genSalt | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setSalt('').build()
  } catch (error) {
    t.pass()
  }
})

test('genHash', async (t) => {
  t.plan(1)

  const genHashMock = () => 'test_hash'

  const crypto = new CryptoBuilder().setHash(genHashMock).build()

  const hash = await crypto.genHash()

  t.equal(hash, 'test_hash')
})

test('genHash | provide custom implementation', async (t) => {
  t.plan(1)

  {
    async function createHash (password, salt) {
      const sha = hash('sha512').update(password).digest()

      return await bcrypt.hash(sha, salt)
    }

    async function createSalt () {
      return '$2b$10$7NPc/v6RLP.vMpnHw17.Fu'
    }

    const crypto = new CryptoBuilder().setSalt(createSalt).setHash(createHash).build()

    const testSalt = await crypto.genSalt()

    const testHash = await crypto.genHash('p4ssw0rd1!', testSalt)

    t.equal(testHash, '$2b$10$7NPc/v6RLP.vMpnHw17.FuskK8dspB/WzXEs45lBREVGXvUykbf.e')
  }

  {
    class TestError extends Error {
      constructor () {
        super('should throw')
      }
    }

    async function createHash (password, salt) {
      await Promise.reject(new TestError())
    }

    async function createSalt () {
      return '$2b$10$7NPc/v6RLP.vMpnHw17.Fu'
    }

    try {
      new CryptoBuilder().setSalt(createSalt).setHash(createHash).build()
    } catch (error) {
      t.equal(error.message, 'should throw')
    }
  }
})

test('genHash | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setHash('').build()
  } catch (error) {
    t.pass()
  }
})
