'use strict'

import { BaseError, BaseErrorType } from './error.mjs'

/**
 *
 * @this {import('fastify').FastifyInstance}
 * @param {import('fastify').FastifyError} error
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */

export default function errorHandler (error, _, reply) {
  if (error instanceof BaseError) {
    this.log.error(error.message, error.stack)

    const statusCode = getHttpStatus(error)
    const response = transformToResponse(error, true)
    reply.code(statusCode).send(response)
  }
}

/**
 *
 * @param {import('./error.mjs').BaseError} error
 */
function getHttpStatus (error) {
  switch (error.type) {
    case BaseErrorType.Validation:
      return 400
    case BaseErrorType.Authorization:
      return 401
    case BaseErrorType.Forbidden:
      return 403
    case BaseErrorType.NotFound:
      return 404
    case BaseErrorType.Internal:
      return 500
    default:
      return 500
  }
}

/**
 *
 * @param {import('./error.mjs').BaseError} error
 */
function transformToResponse (error, debug) {
  const { message, code, stack = '', details } = error

  return {
    message,
    code,
    details: details?.constructor === Error ? details.message : details,
    ...(debug
      ? {
          stack: stack.split('\n')
        }
      : {})
  }
}
