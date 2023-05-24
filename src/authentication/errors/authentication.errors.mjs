import { ValidationError } from '../../common/errors/error.mjs'

export class UserRegisteredError extends ValidationError {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`user with id=${id} is already registered`, 'USER_ALREADY_REGISTERED')
  }
}

export class PasswordsVaryError extends ValidationError {
  constructor () {
    super("'password' and 'confirmPassword' vary", 'PASSWORDS_VARY')
  }
}
