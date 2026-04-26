import { UnauthorizedException } from '@nestjs/common'
import { getTenantContext } from './tenant-context'

export function requireUserId(): string {
  const { userId } = getTenantContext()
  if (!userId) {
    throw new UnauthorizedException({
      code: 'AUTH_UNAUTHORIZED',
      message: 'Missing user context',
    })
  }
  return userId
}

