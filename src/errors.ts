import { createError } from '@adonisjs/core/exceptions'

export const E_INVALID_CHECKSUM = createError<[string]>(
  'Invalid checksum for component "%s"',
  'E_INVALID_CHECKSUM',
  403
)
