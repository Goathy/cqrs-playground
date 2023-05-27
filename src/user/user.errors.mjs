'use strict'

import { NotFoundError } from '../common/errors/error.mjs'

export class UserNotFoundError extends NotFoundError {
  constructor () {
    super('user not found', 'USER_NOT_FOUND')
  }
}
