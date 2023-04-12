'use strict'

import { randomUUID } from 'node:crypto'
import fp from 'fastify-plugin'

export const crypto = {
  uuid: randomUUID
}

export default fp(async function (app) {
  app.decorate('crypto', crypto)
})
