'use strict'

import { InternalError } from '../errors/error.mjs'

export class CryptoSaltError extends InternalError {
  constructor (details) {
    super("unable to generate 'salt'", 'CRYPTO_SALT_ERROR', details)
  }
}

export class CryptoHashError extends InternalError {
  constructor (details) {
    super("unable to generate 'hash'", 'CRYPTO_HASH_ERROR', details)
  }
}

export class CryptoCompareError extends InternalError {
  constructor (details) {
    super("unable to 'compare'", 'CRYPTO_COMPARE_ERROR', details)
  }
}
