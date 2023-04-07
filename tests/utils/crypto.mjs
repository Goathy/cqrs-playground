import fp from 'fastify-plugin'

export default fp(async function (app) {
  app.decorate('crypto', {
    uuid: () => 'b9f310bc-bd77-4734-ad91-6b6b8b490665'
  })
})
