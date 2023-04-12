import { test } from 'tap'
import { crypto } from './crypto.mjs'
import uuidRegex from '../../tests/utils/uuid.mjs'

test('uuid', async (t) => {
  t.plan(1)

  const uuid = crypto.uuid()

  t.match(uuid, uuidRegex)
})

test('genSalt', { todo: true })
test('genSalt | throw error', { todo: true })
test('genHash', { todo: true })
test('genHash | throw error', { todo: true })
