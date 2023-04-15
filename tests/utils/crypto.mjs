import fp from 'fastify-plugin'
import { CryptoBuilder } from '../../src/common/crypto.mjs'

export default fp(async function (app) {
  app.decorate('crypto', new CryptoBuilder()
    .setUUID(() => 'b9f310bc-bd77-4734-ad91-6b6b8b490665')
    .setSalt(async () => '$2b$10$7NPc/v6RLP.vMpnHw17.Fu')
    .setHash(async () => '$2b$10$7NPc/v6RLP.vMpnHw17.FuskK8dspB/WzXEs45lBREVGXvUykbf.e')
    .setCompare(async (hash, password) => password === 'p4ssw0rd!1')
    .build())
})
