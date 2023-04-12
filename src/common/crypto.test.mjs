import { test } from 'tap'
import { Crypto } from './crypto.mjs'
import uuidRegex from '../../tests/utils/uuid.mjs'
import c from 'node:crypto'
import b from 'bcrypt'

test('uuid', async (t) => {
  t.plan(1)

  const crypto = new Crypto({ ...c, ...b })
  const uuid = crypto.uuid()

  t.match(uuid, uuidRegex)
})

test('genSalt', async (t) => {
  t.plan(2)

  const crypto = new Crypto({ ...c, ...b })
  const salt = await crypto.genSalt()

  t.equal(salt.length, 29)
  t.match(salt, /^\$2b\$10\$/)
})

test('genSalt | throw error', async (t) => {
  t.plan(1)

  try {
    const crypto = new Crypto({ ...c, genSalt: () => { throw new Error('test') } })
    await crypto.genSalt()
  } catch (error) {
    const { message, code, type } = error

    t.same({ message, code, type }, {
      message: "error occur during 'salt' generation",
      code: 'CRYPTO_SALT_ERROR',
      type: 'INTERNAL'
    })
  }
})

test('genHash', { todo: true })
test('genHash | throw error', { todo: true })
