'use strict'

import fp from 'fastify-plugin'
import assert from 'node:assert'

export class CryptoBuilder {
  #uuid
  #salt
  #hash
  #compare

  setUUID (generator) {
    assert.strictEqual(typeof generator, 'function', "setUUID 'generator' is not a function")

    this.#uuid = generator

    return this
  }

  setSalt (generator) {
    assert.strictEqual(typeof generator, 'function', "setSalt 'generator' is not a function")

    this.#salt = generator

    return this
  }

  setHash (generator) {
    assert.strictEqual(typeof generator, 'function', "setHash 'generator' is not a function")

    this.#hash = generator

    return this
  }

  setCompare (generator) {
    assert.strictEqual(typeof generator, 'function', "setCompare 'generator' is not a function")

    this.#compare = generator

    return this
  }

  build () {
    return {
      uuid: this.#uuid,
      genSalt: this.#salt,
      genHash: this.#hash,
      compare: this.#compare
    }
  }
}

export default fp(async function (app, opts) {
  const crypto = opts.builder.build()

  app.decorate('crypto', crypto)
})
