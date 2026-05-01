import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'

@Controller('reports')
@UseGuards(PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @RequirePermission('reports.read')
  async daily() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getDailySummary(companyId)
    return { success: true, data }
  }

  @Get('setup-status')
  @RequirePermission('reports.read')
  async setupStatus() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSetupStatus(companyId)
    return { success: true, data }
  }

  @Get('sales')
  @RequirePermission('reports.read')
  async sales() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesDashboard(companyId)
    return { success: true, data }
  }

  @Get('profits')
  @RequirePermission('reports.read', 'reports.view_costs')
  async profits() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getDailySummary(companyId)
    return { success: true, data: { profit: data.profits } }
  }

  @Get('trend')
  @RequirePermission('reports.read')
  async trend() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesTrend(companyId)
    return { success: true, data }
  }

  @Get('top-products')
  @RequirePermission('reports.read')
  async topProducts() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getTopProducts(companyId)
    return { success: true, data }
  }

  @Get('sales-by-category')
  @RequirePermission('reports.read')
  async salesByCategory(@Query('from') from?: string, @Query('to') to?: string) {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesByCategory(companyId, { from, to })
    return { success: true, data }
  }

  @Get('stock')
  @RequirePermission('reports.read')
  async stock() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getStockReport(companyId)
    return { success: true, data }
  }

  @Get('treasury')
  @RequirePermission('reports.read')
  async treasury() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getTreasuryReport(companyId)
    return { success: true, data }
  }
}
