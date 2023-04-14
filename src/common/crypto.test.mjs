import { test } from 'tap'
import { CryptoBuilder } from './crypto.mjs'

test('compare', async (t) => {
  t.plan(1)

  const compareMock = () => true

  const crypto = new CryptoBuilder().setCompare(compareMock).build()

  const equal = await crypto.compare()

  t.ok(equal)
})

test('compare | throw error if passwords vary', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setCompare('').build()
  } catch (error) {
    t.pass()
  }
})

test('addUUID', async (t) => {
  t.plan(1)

  const uuidGenMock = () => '9dd0de4a-70cd-4c83-91cc-1f1a369e006a'

  const crypto = new CryptoBuilder().setUUID(uuidGenMock).build()

  const uuid = '9dd0de4a-70cd-4c83-91cc-1f1a369e006a'

  t.equal(crypto.uuid(), uuid)
})

test('addUUID | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setUUID('').build()
  } catch (error) {
    t.pass()
  }
})

test('addSalt', async (t) => {
  t.plan(1)

  const saltGenMock = () => 'test_salt'

  const crypto = new CryptoBuilder().setSalt(saltGenMock).build()

  const salt = crypto.genSalt()

  t.equal(salt, 'test_salt')
})

test('addSalt | generator should be a function', async (t) => {
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

test('genHash | generator should be a function', async (t) => {
  t.plan(1)

  try {
    new CryptoBuilder().setHash('').build()
  } catch (error) {
    t.pass()
  }
})
