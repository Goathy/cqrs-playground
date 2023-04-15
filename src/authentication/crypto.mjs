'use strict'

import bcrypt from 'bcrypt'
import { CryptoSaltError, CryptoHashError, CryptoCompareError } from './errors/crypto.errors.mjs'
import crypto from 'node:crypto'

export async function createSalt () {
  try {
    return await bcrypt.genSalt(10, 'b')
  } catch (error) {
    throw new CryptoSaltError(error)
  }
}

export function createUUID () {
  return crypto.randomUUID()
}

export async function createHash (password, salt) {
  try {
    password = crypto.createHash('sha512').update(password).digest()
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new CryptoHashError(error)
  }
}

export async function compare (hash, password) {
  try {
    password = crypto.createHash('sha512').update(password).digest()
    return await bcrypt.compare(password, hash)
  } catch (error) {
    throw new CryptoCompareError(error)
  }
}
