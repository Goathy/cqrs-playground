'use strict'

import { S } from 'fluent-json-schema'

export const registerUserSchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('password', S.string().minLength(8).maxLength(30).required())
  .prop('confirmPassword', S.string().minLength(8).maxLength(30).required())
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
