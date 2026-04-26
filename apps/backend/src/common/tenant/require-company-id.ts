import { BadRequestException } from '@nestjs/common'
import { getTenantContext } from './tenant-context'

export function requireCompanyId(): string {
  const { companyId } = getTenantContext()
  if (!companyId) {
    throw new BadRequestException({
      code: 'TENANT_MISSING',
      message: 'Missing company context',
    })
  }
  return companyId
}

