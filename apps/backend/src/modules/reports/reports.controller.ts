import { Controller, Get, Query } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  async daily() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getDailySummary(companyId)
    return { success: true, data }
  }

  @Get('sales')
  async sales() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesDashboard(companyId)
    return { success: true, data }
  }

  @Get('profits')
  async profits() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getDailySummary(companyId)
    return { success: true, data: { profit: data.profits } }
  }

  @Get('trend')
  async trend() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesTrend(companyId)
    return { success: true, data }
  }

  @Get('top-products')
  async topProducts() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getTopProducts(companyId)
    return { success: true, data }
  }

  @Get('sales-by-category')
  async salesByCategory(@Query('from') from?: string, @Query('to') to?: string) {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getSalesByCategory(companyId, { from, to })
    return { success: true, data }
  }

  @Get('stock')
  async stock() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getStockReport(companyId)
    return { success: true, data }
  }

  @Get('treasury')
  async treasury() {
    const companyId = requireCompanyId()
    const data = await this.reportsService.getTreasuryReport(companyId)
    return { success: true, data }
  }
}
