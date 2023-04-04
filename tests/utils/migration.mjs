import { exec as cexec } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const TEST_DATABASE = join(tmpdir(), 'test.sqlite')

const exec = promisify(cexec)

export async function runMigration () {
  await exec(`yarn postgrator --database ${TEST_DATABASE}`)
}
