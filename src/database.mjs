import connect from '@databases/sqlite'
import fp from 'fastify-plugin'
/**
 * @param {import('fastify').FastifyInstance} app
 */
export default fp(async function database (app, opts = { database: 'db.sqlite' }) {
  const db = connect(opts.database)

  app.decorate('db', db)

  app.addHook('onClose', async () => await db.dispose())
})
