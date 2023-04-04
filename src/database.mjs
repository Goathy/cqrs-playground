'use strict'

import connect from '@databases/sqlite'
import fp from 'fastify-plugin'

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default fp(async function database (app, opts) {
  if ('database' in opts === false) {
    throw new Error("'opts.database' option is required")
  }

  const db = connect(opts.database)

  app.decorate('db', db)

  app.addHook('onClose', async () => await db.dispose())
})
