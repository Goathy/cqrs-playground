'use strict'

import bcrypt from 'bcrypt'
import { CryptoSaltError, CryptoHashError, CryptoCompareError } from './crypto.errors.mjs'
import { randomUUID, createHash } from 'node:crypto'
import fp from 'fastify-plugin'

async function salt () {
  try {
    return await bcrypt.genSalt(10, 'b')
  } catch (error) {
    throw new CryptoSaltError(error)
  }
}

function uuid () {
  return randomUUID()
}

/**
 * @param {string} password
 * @param {string} salt
 * @returns {string}
 */
async function hash (password, salt) {
  try {
    password = createHash('sha512').update(password).digest()
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new CryptoHashError(error)
  }
}

/**
 * @param {string} hash
 * @param {string} password
 * @returns {string}
 */
async function compare (hash, password) {
  try {
    password = hash('sha512').update(password).digest()
    return await bcrypt.compare(password, hash)
  } catch (error) {
    throw new CryptoCompareError(error)
  }
}

/** @param {import('fastify').FastifyInstance} app */
function crypto (app, _, done) {
  app.decorate('crypto', { compare, hash, salt, uuid })

  done()
}

export default fp(crypto)
