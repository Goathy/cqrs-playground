'use strict'

import connect from '@databases/sqlite'
import fp from 'fastify-plugin'

/**
 * @typedef {Object} Options
 * @property {string} database
 */

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {Options} opts
 */
async function database (app, opts) {
  /* c8 ignore next 3 */
  if ('database' in opts === false) {
    throw new Error("'opts.database' option is required")
  }

  const db = connect(opts.database)

  app.decorate('db', db)

  app.addHook('onClose', async () => await db.dispose())
}

export default fp(database)
