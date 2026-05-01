import { Global, Module } from '@nestjs/common'
import { PolicyEvaluatorService } from './policy-evaluator.service'
import { PermissionGuard } from './permission.guard'

@Global()
@Module({
  providers: [PolicyEvaluatorService, PermissionGuard],
  exports: [PolicyEvaluatorService, PermissionGuard],
})
export class RbacModule {}
