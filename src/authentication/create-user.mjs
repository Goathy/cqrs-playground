import { randomBytes, scrypt as cscrypt } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(cscrypt)

export async function createUser ({ password, ...rest }) {
  const salt = randomBytes(16).toString('hex').slice(0, 16)
  const hash = await scrypt(password, salt, 32)

  return Object.assign(rest, { password: `${salt}:${hash.toString('hex')}` })
}
