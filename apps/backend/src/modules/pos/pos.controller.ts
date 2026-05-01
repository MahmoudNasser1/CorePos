import { Body, Controller, Delete, Get, Headers, Param, Post, Query, UseGuards } from '@nestjs/common'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { PosService } from './pos.service'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'

@Controller('pos')
@UseGuards(PermissionGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('held-carts')
  @RequirePermission('pos.execute')
  async saveHeldCart(@Headers('idempotency-key') idempotencyKey: string | undefined, @Body() body: any) {
    const companyId = requireCompanyId()
    return this.posService.saveHeldCart({
      companyId,
      branchId: body.branchId,
      customerId: body.customerId ?? null,
      items: body.items,
      total: body.total,
      notes: body.notes,
      createdBy: body.createdBy,
      idempotencyKey,
    })
  }

  @Get('held-carts')
  @RequirePermission('pos.execute')
  async listHeldCarts(@Query('branchId') branchId: string, @Query('limit') limit?: string) {
    const companyId = requireCompanyId()
    return this.posService.listHeldCarts(companyId, branchId, limit ? Number(limit) : undefined)
  }

  @Delete('held-carts/:id')
  @RequirePermission('pos.execute')
  async deleteHeldCart(@Param('id') id: string) {
    const companyId = requireCompanyId()
    return this.posService.deleteHeldCart(companyId, id)
  }
}

