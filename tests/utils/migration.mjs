import { exec as cexec } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import connect from '@databases/sqlite'
import { unlink } from 'node:fs/promises'

export const TEST_DATABASE = join(tmpdir(), 'test.sqlite')

const exec = promisify(cexec)

export async function runMigration () {
  await exec(`yarn postgrator --database ${TEST_DATABASE}`)
}

export async function prepare () {
  await exec(`yarn postgrator --database ${TEST_DATABASE}`)
  return connect(TEST_DATABASE)
}

export async function clean () {
  await unlink(TEST_DATABASE)
}
