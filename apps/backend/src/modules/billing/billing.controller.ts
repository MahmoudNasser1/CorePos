import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { BillingService } from './billing.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'

@Controller('billing')
@UseGuards(PermissionGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('usage')
  @RequirePermission('billing.read')
  async getUsage() {
    const companyId = requireCompanyId()
    const usage = await this.billingService.getUsage(companyId)
    return { success: true, data: usage }
  }

  @Get('current')
  @RequirePermission('billing.read')
  async getCurrent() {
    const companyId = requireCompanyId()
    const sub = await this.billingService.getSubscription(companyId)
    return { success: true, data: sub }
  }

  @Post('checkout')
  @RequirePermission('admin.settings.manage')
  async checkout(@Body() body: { planId: string, billingCycle: 'monthly' | 'yearly' }) {
    const companyId = requireCompanyId()
    const result = await this.billingService.createCheckout(companyId, body.planId, body.billingCycle)
    return { success: true, data: result }
  }
}

