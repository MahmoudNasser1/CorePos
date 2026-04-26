import { Controller, Get, UseGuards } from '@nestjs/common'
import { PlatformAdminService } from './platform-admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'

@Controller('platform-admin')
@UseGuards(PlatformAdminGuard)
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('overview')
  async overview() {
    const data = await this.platformAdminService.getOverview()
    return { success: true, data }
  }
}

