import { exec as cexec } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import connect from '@databases/sqlite'
import { unlink } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'

export const TEST_DATABASE = join(tmpdir(), 'test.sqlite')

const FILE_NAME = randomBytes(10).toString('hex')
const PATH = join(tmpdir(), `${FILE_NAME}.sqlite`)

const exec = promisify(cexec)

export async function runMigration () {
  await exec(`yarn postgrator --database ${TEST_DATABASE}`)
}

export async function prepare () {
  await exec(`yarn postgrator --database ${PATH}`)
  return connect(PATH)
}

export async function clean () {
  await unlink(PATH)
}
