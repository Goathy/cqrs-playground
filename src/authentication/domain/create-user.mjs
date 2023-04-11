'use strict'

export async function createUser ({ crypto }, { password, ...rest }) {
  const salt = crypto.genSalt(16)
  const hash = await crypto.genHash(password, salt, 32)

  return Object.assign(rest, { password: `${salt}:${hash.toString('hex')}` })
}
