'use strict'

import { BaseError, BaseErrorType } from './error.mjs'
import fp from 'fastify-plugin'

/**
 * @param {import('fastify').FastifyInstance}
 */
export default fp(async function (app) {
  app.setErrorHandler(errorHandler)

  function errorHandler (error, _, reply) {
    if (error instanceof BaseError) {
      this.log.error(error.message, error.stack)

      const statusCode = getHttpStatus(error)
      const response = transformToResponse(error, false)

      reply.code(statusCode).send(response)
    } else {
      return error
    }
  }

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
})
