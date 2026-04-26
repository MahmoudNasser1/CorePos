import { Module } from '@nestjs/common'
import { PlatformAdminController } from './platform-admin.controller'
import { PlatformAdminService } from './platform-admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { PlatformAuditService } from '../../common/audit/platform-audit.service'

@Module({
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService, PlatformAdminGuard, PlatformAuditService],
})
export class PlatformAdminModule {}

