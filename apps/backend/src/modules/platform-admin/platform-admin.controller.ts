import { Body, Controller, Get, Ip, Param, Patch, Query, Req, UseGuards } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { PlatformAdminService } from './platform-admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { PlatformAuditService } from '../../common/audit/platform-audit.service'
import { requireUserId } from '../../common/tenant/require-user-id'
import type { Request } from 'express'

type RequestWithId = Request & { id?: string }

class UpdateSubscriptionDto {
  @ApiProperty({ example: 'Support extended trial', required: true })
  @IsString()
  @MaxLength(240)
  reason!: string

  @ApiProperty({ required: false, example: 'trialing', enum: ['active', 'trialing', 'expired', 'cancelled', 'past_due'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'trialing', 'expired', 'cancelled', 'past_due'])
  status?: string

  @ApiProperty({ required: false, example: 'pro' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  planId?: string

  @ApiProperty({ required: false, example: 14, description: 'Extend current period end by N days (trial extension)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  extendDays?: number
}

@Controller('platform-admin')
@UseGuards(PlatformAdminGuard)
export class PlatformAdminController {
  constructor(
    private readonly platformAdminService: PlatformAdminService,
    private readonly platformAuditService: PlatformAuditService,
  ) {}

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

  @Patch('companies/:id/subscription')
  async updateSubscription(
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionDto,
    @Req() req: RequestWithId,
    @Ip() ip?: string,
  ) {
    const actorUserId = requireUserId()

    const before = await this.platformAdminService.getCompany(id)
    const updated = await this.platformAdminService.updateCompanySubscription(id, {
      status: body.status,
      planId: body.planId,
      extendDays: body.extendDays,
    })
    const after = await this.platformAdminService.getCompany(id)

    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.company.subscription.update',
      targetType: 'company',
      targetId: id,
      companyId: id,
      reason: body.reason,
      meta: {
        before: { subscription: before.subscription },
        input: { status: body.status, planId: body.planId, extendDays: body.extendDays },
        after: { subscription: after.subscription },
        updated,
      },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })

    return { success: true, data: after.subscription }
  }
}

