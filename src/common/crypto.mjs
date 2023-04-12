'use strict'

import { randomUUID } from 'node:crypto'
import fp from 'fastify-plugin'
import bcrypt from 'bcrypt'
import { InternalError } from './errors/error.mjs'
import assert from 'node:assert'

export class CryptoSaltError extends InternalError {
  constructor () {
    super("error occur during 'salt' generation", 'CRYPTO_SALT_ERROR')
  }
}

export class Crypto {
  #crypto
  // TODO: Pass opts object to Crypto constructor to configure genSalt method
  constructor (crypto) {
    assert.strictEqual(typeof crypto?.randomUUID, 'function', 'crypto do not implement \'randomUUID\' method')
    assert.strictEqual(typeof crypto?.genSalt, 'function', 'crypto do not implement \'genSalt\' method')

    this.#crypto = {
      uuid: crypto.randomUUID,
      genSalt: crypto.genSalt
    }
  }

  uuid () {
    return this.#crypto.uuid()
  }

  async genSalt () {
    try {
      return await this.#crypto.genSalt()
    } catch (error) {
      throw new CryptoSaltError()
    }
  }
}

export const crypto = {
  uuid: randomUUID,
  genSalt: async (rounds = 10, version = 'b') => await bcrypt.genSalt(rounds, version)
}

export default fp(async function (app) {
  app.decorate('crypto', crypto)
})
