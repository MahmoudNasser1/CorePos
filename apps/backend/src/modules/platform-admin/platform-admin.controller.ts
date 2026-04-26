import { BadRequestException, Body, Controller, Get, Ip, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
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

class ListAuditLogsDto {
  @ApiProperty({ required: false, example: 'platform.company.subscription.update' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  action?: string

  @ApiProperty({ required: false, example: 'uuid-company-id' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string

  @ApiProperty({ required: false, example: '2026-01-01' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  from?: string

  @ApiProperty({ required: false, example: '2026-01-31' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  to?: string
}

class ListUsersDto {
  @ApiProperty({ required: false, example: 'ahmed' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string

  @ApiProperty({ required: false, example: 'uuid-company-id' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string

  @ApiProperty({ required: false, example: 'viewer' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  role?: string

  @ApiProperty({ required: false, example: 'active', enum: ['active', 'disabled'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'disabled'])
  status?: string
}

class UpdateUserDto {
  @ApiProperty({ required: true, example: 'Support: disable user on request' })
  @IsString()
  @MaxLength(240)
  reason!: string

  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean

  @ApiProperty({ required: false, example: 'manager' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  role?: string

  @ApiProperty({ required: false, example: 'uuid-org-unit-id' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  orgUnitId?: string
}

class ResetPasswordDto {
  @ApiProperty({ required: true, example: 'User forgot password (KYC verified)' })
  @IsString()
  @MaxLength(240)
  reason!: string
}

class OrgUnitDto {
  @ApiProperty({ required: true, example: 'uuid-company-id' })
  @IsString()
  @MaxLength(64)
  companyId!: string

  @ApiProperty({ required: true, example: 'المبيعات' })
  @IsString()
  @MaxLength(80)
  name!: string

  @ApiProperty({ required: false, example: 'uuid-parent-org-unit' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  parentId?: string

  @ApiProperty({ required: true, example: 'Support: reorganize departments' })
  @IsString()
  @MaxLength(240)
  reason!: string
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

  @Get('audit-logs')
  async auditLogs(@Query() q: ListAuditLogsDto) {
    const data = await this.platformAdminService.listAuditLogs({
      action: (q.action ?? '').trim(),
      companyId: (q.companyId ?? '').trim(),
      from: (q.from ?? '').trim(),
      to: (q.to ?? '').trim(),
    })
    return { success: true, data }
  }

  @Get('users')
  async users(@Query() q: ListUsersDto) {
    const data = await this.platformAdminService.listUsers({
      search: (q.search ?? '').trim(),
      companyId: (q.companyId ?? '').trim(),
      role: (q.role ?? '').trim(),
      status: (q.status ?? '').trim(),
    })
    return { success: true, data }
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req: RequestWithId,
    @Ip() ip?: string,
  ) {
    const actorUserId = requireUserId()
    const patch = {
      isActive: body.isActive,
      role: body.role,
      orgUnitId: body.orgUnitId,
    }
    if (patch.isActive === undefined && (patch.role ?? '').trim() === '' && (patch.orgUnitId ?? '').trim() === '') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'No user changes provided' })
    }

    const before = await this.platformAdminService.getUser(id)
    const updated = await this.platformAdminService.updateUser(id, patch)
    const after = await this.platformAdminService.getUser(id)

    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.user.update',
      targetType: 'user',
      targetId: id,
      companyId: after.companyId ?? null,
      reason: body.reason,
      meta: { before, patch, updated, after },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })

    return { success: true, data: after }
  }

  @Post('users/:id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: ResetPasswordDto,
    @Req() req: RequestWithId,
    @Ip() ip?: string,
  ) {
    const actorUserId = requireUserId()

    const before = await this.platformAdminService.getUser(id)
    const result = await this.platformAdminService.resetUserPassword(id)

    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.user.reset_password',
      targetType: 'user',
      targetId: id,
      companyId: before.companyId ?? null,
      reason: body.reason,
      meta: { userId: id },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })

    return { success: true, data: result }
  }

  @Get('org-units')
  async orgUnits(@Query('companyId') companyId?: string) {
    const id = (companyId ?? '').trim()
    const data = await this.platformAdminService.listOrgUnits(id)
    return { success: true, data }
  }

  @Post('org-units')
  async createOrgUnit(@Body() body: OrgUnitDto, @Req() req: RequestWithId, @Ip() ip?: string) {
    const actorUserId = requireUserId()
    const data = await this.platformAdminService.createOrgUnit(body)
    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.org_unit.create',
      targetType: 'org_unit',
      targetId: data.id,
      companyId: data.companyId,
      reason: body.reason,
      meta: { orgUnit: data },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })
    return { success: true, data }
  }

  @Patch('org-units/:id')
  async updateOrgUnit(
    @Param('id') id: string,
    @Body() body: OrgUnitDto,
    @Req() req: RequestWithId,
    @Ip() ip?: string,
  ) {
    const actorUserId = requireUserId()
    const before = await this.platformAdminService.getOrgUnit(id)
    const data = await this.platformAdminService.updateOrgUnit(id, body)
    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.org_unit.update',
      targetType: 'org_unit',
      targetId: id,
      companyId: data.companyId,
      reason: body.reason,
      meta: { before, after: data },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })
    return { success: true, data }
  }

  @Post('org-units/:id/delete')
  async deleteOrgUnit(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: RequestWithId, @Ip() ip?: string) {
    const actorUserId = requireUserId()
    const before = await this.platformAdminService.getOrgUnit(id)
    await this.platformAdminService.deleteOrgUnit(id)
    await this.platformAuditService.write({
      actorUserId,
      action: 'platform.org_unit.delete',
      targetType: 'org_unit',
      targetId: id,
      companyId: before.companyId,
      reason: String(body?.reason ?? '').trim() || 'delete org unit',
      meta: { before },
      ip: ip ?? null,
      requestId: req.id ?? null,
    })
    return { success: true, data: { ok: true } }
  }
}

