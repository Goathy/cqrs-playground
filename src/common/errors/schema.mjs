'use strict'

import { S } from 'fluent-json-schema'

export const errorSchema = S.object()
  .description('error response')
  .prop('message', S.string())
  .prop('code', S.string())
  .prop('details', S.string())
  .prop('stack', S.array().anyOf([S.string()]))
