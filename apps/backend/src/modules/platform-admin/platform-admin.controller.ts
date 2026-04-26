import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get('companies')
  async companies(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
  ) {
    const data = await this.platformAdminService.listCompanies({
      search: (search ?? '').trim(),
      status: (status ?? '').trim(),
      plan: (plan ?? '').trim(),
    })
    return { success: true, data }
  }

  @Get('companies/:id')
  async company(@Param('id') id: string) {
    const data = await this.platformAdminService.getCompany(id)
    return { success: true, data }
  }
}

