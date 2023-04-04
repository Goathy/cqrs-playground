'use strict'

export default async function (fastify) {
  fastify.get('/happy', {
    schema: {
      description: 'happy path :D',
      tags: ['happy']
    }
  }, () => 'Happy Path :D')
}
