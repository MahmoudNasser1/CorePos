import { Module } from '@nestjs/common'
import { PlatformAdminController } from './platform-admin.controller'
import { PlatformAdminService } from './platform-admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { PlatformAuditService } from '../../common/audit/platform-audit.service'
import { PolicyEvaluatorService } from '../../common/rbac/policy-evaluator.service'

@Module({
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService, PlatformAdminGuard, PlatformAuditService, PolicyEvaluatorService],
})
export class PlatformAdminModule {}

