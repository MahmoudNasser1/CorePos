import { Controller, Get } from '@nestjs/common'

@Controller('admin')
export class AdminController {
  @Get('companies')
  companies() {
    return { success: true, data: [] }
  }

  @Get('audit-logs')
  auditLogs() {
    return { success: true, data: [] }
  }
}
