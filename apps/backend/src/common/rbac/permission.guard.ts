import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY } from './require-permission.decorator'
import { PermissionKey } from './permission-keys'
import { PolicyEvaluatorService } from './policy-evaluator.service'
import { getTenantContext } from '../tenant/tenant-context'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyEvaluator: PolicyEvaluatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { userId, companyId } = getTenantContext()
    const request = context.switchToHttp().getRequest()
    
    // Fallback to headers if context is not populated (e.g. before middleware)
    const effectiveUserId = userId || request.headers['x-user-id']
    const effectiveCompanyId = companyId || request.headers['x-company-id']

    if (!effectiveUserId || !effectiveCompanyId) {
      throw new UnauthorizedException({
        code: 'RBAC_MISSING_CONTEXT',
        message: 'User or Company context missing for permission check',
      })
    }

    const userPermissions = await this.policyEvaluator.getEffectivePermissions({
      userId: effectiveUserId,
      companyId: effectiveCompanyId,
    })

    const hasAll = requiredPermissions.every((p) => userPermissions.has(p))

    if (!hasAll) {
      throw new ForbiddenException({
        code: 'RBAC_FORBIDDEN',
        message: 'ليس لديك الصلاحيات الكافية لإجراء هذه العملية',
        required: requiredPermissions,
      })
    }

    return true
  }
}
