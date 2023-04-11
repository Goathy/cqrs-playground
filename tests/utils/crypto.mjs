import fp from 'fastify-plugin'
import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

export default fp(async function (app) {
  app.decorate('crypto', {
    uuid: () => 'b9f310bc-bd77-4734-ad91-6b6b8b490665',
    genSalt: (len) => randomBytes(len).toString('hex').slice(0, len),
    genHash: (password, salt, len) => promisify(scrypt)(password, salt, len)
  })
})
