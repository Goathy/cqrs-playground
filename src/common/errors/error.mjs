'use strict'

export const BaseErrorType = {
  Validation: 'VALIDATION',
  Authorization: 'AUTHORIZATION',
  NotFound: 'NOT_FOUND',
  Forbidden: 'FORBIDDEN',
  Internal: 'INTERNAL'
}

export class BaseError extends Error {
  constructor (message, code, type, details) {
    super(message)
    this.code = code
    this.type = type
    this.details = details
  }
}

export class ValidationError extends BaseError {
  constructor (message, code, details) {
    super(message, code, BaseErrorType.Validation, details)
  }
}

export class UnauthorizedError extends BaseError {
  constructor (message, code, details) {
    super(message, code, BaseErrorType.Authorization, details)
  }
}

export class NotFoundError extends BaseError {
  constructor (message, code, details) {
    super(message, code, BaseErrorType.NotFound, details)
  }
}

export class ForbiddenError extends BaseError {
  constructor (message, code, details) {
    super(message, code, BaseErrorType.Forbidden, details)
  }
}

export class InternalError extends BaseError {
  constructor (message, code, details) {
    super(message, code, BaseErrorType.Internal, details)
  }
}
