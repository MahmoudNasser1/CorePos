import { Body, Controller, Get, Headers, Param, Patch, Post, Delete, BadRequestException } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { AdminService } from './admin.service'
import { requireUserId } from '../../common/tenant/require-user-id'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'
import { UseGuards } from '@nestjs/common'

class CreateBranchDto {
  @ApiProperty({ example: 'فرع القاهرة - وسط البلد' })
  @IsString()
  name!: string

  @ApiProperty({ example: 'العنوان', required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: '01xxxxxxxxx', required: false })
  @IsOptional()
  @IsString()
  phone?: string
}

class UpdateBranchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  isActive?: boolean
}

class UpdateCompanyDto {
  @ApiProperty({ example: 'CorePOS', required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ example: '01000000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: 'العنوان', required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: 'company@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vatRate?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string

  @ApiProperty({ required: false, example: 'EG' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string

  @ApiProperty({ required: false, example: 'Africa/Cairo' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string

  @ApiProperty({ required: false, example: 'uuid-branch' })
  @IsOptional()
  @IsString()
  defaultBranchId?: string
}

class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email!: string

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  password?: string

  @ApiProperty({ example: 'الاسم الكامل' })
  @IsString()
  fullName!: string

  @ApiProperty({ example: 'admin' })
  @IsString()
  role!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string
}

class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: 'تغيير المسمى الوظيفي' })
  @IsString()
  reason!: string
}

class ReasonDto {
  @ApiProperty({ example: 'سبب الإجراء' })
  @IsString()
  reason!: string
}


class CreateWarehouseDto {
  @ApiProperty({ example: 'المخزن الرئيسي' })
  @IsString()
  name!: string

  @ApiProperty({ example: 'uuid-branch' })
  @IsString()
  branchId!: string

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isDefault?: boolean

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  isActive?: boolean
}

class UpdateWarehouseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  isDefault?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean
}

class UpdateMyProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  quickStartDismissed?: boolean
}

class CreatePrintTemplateDto {
  @ApiProperty()
  @IsString()
  type!: string

  @ApiProperty()
  @IsString()
  name!: string

  @ApiProperty()
  @IsString()
  contentHtml!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

class UpdatePrintTemplateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentHtml?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

class UpsertPrintSettingsDto {
  @ApiProperty()
  @IsString()
  documentType!: string

  @ApiProperty()
  @IsString()
  paperSize!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  printerName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marginConfig?: string
}

@Controller('admin')
@UseGuards(PermissionGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('companies')
  companies() {
    return { success: true, data: [] }
  }

  @Get('branches')
  @RequirePermission('admin.settings.read')
  async branches(@Headers('x-company-id') companyId?: string) {
    const items = companyId ? await this.adminService.listBranches(companyId) : []
    return { success: true, data: items }
  }

  @Post('branches')
  @RequirePermission('admin.settings.manage')
  async createBranch(@Headers('x-company-id') companyId: string | undefined, @Body() body: CreateBranchDto) {
    const actorId = requireUserId()
    const row = companyId ? await this.adminService.createBranch(companyId, actorId, body) : null
    return { success: true, data: row }
  }

  @Patch('branches/:id')
  @RequirePermission('branches.manage')
  async updateBranch(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateBranchDto,
  ) {
    const actorId = requireUserId()
    const row = companyId ? await this.adminService.updateBranch(companyId, actorId, id, body) : null
    return { success: true, data: row }
  }

  @Get('warehouses')
  @RequirePermission('warehouses.manage')
  async warehouses(@Headers('x-company-id') companyId?: string) {
    const items = companyId ? await this.adminService.listWarehouses(companyId) : []
    return { success: true, data: items }
  }

  @Post('warehouses')
  @RequirePermission('warehouses.manage')
  async createWarehouse(@Headers('x-company-id') companyId: string | undefined, @Body() body: CreateWarehouseDto) {
    const actorId = requireUserId()
    const row = companyId ? await this.adminService.createWarehouse(companyId, actorId, body) : null
    return { success: true, data: row }
  }

  @Patch('warehouses/:id')
  @RequirePermission('warehouses.manage')
  async updateWarehouse(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateWarehouseDto,
  ) {
    const actorId = requireUserId()
    const row = companyId ? await this.adminService.updateWarehouse(companyId, actorId, id, body) : null
    return { success: true, data: row }
  }

  @Get('company')
  @RequirePermission('admin.settings.read')
  async company(@Headers('x-company-id') companyId?: string) {
    const item = companyId ? await this.adminService.getCompany(companyId) : null
    return { success: true, data: item }
  }

  @Post('company')
  @RequirePermission('admin.settings.manage')
  async updateCompany(@Headers('x-company-id') companyId: string | undefined, @Body() body: UpdateCompanyDto) {
    const actorId = requireUserId()
    const item = companyId ? await this.adminService.updateCompany(companyId, actorId, body) : null
    return { success: true, data: item }
  }

  @Get('users')
  @RequirePermission('admin.users.manage')
  async users(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const items = await this.adminService.listUsers(companyId)
    return { success: true, data: items }
  }

  @Post('users')
  @RequirePermission('admin.users.manage')
  async createUser(@Headers('x-company-id') companyId: string | undefined, @Body() body: CreateUserDto) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.createUser(companyId, actorId, body)
    return { success: true, data: row }
  }

  @Patch('users/:id')
  @RequirePermission('admin.users.manage')
  async updateUser(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.updateUser(companyId, actorId, id, body)
    return { success: true, data: row }
  }

  @Post('users/:id/toggle-active')
  @RequirePermission('admin.users.manage')
  async toggleUserActive(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: ReasonDto,
  ) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.toggleUserActive(companyId, actorId, id, body.reason)
    return { success: true, data: row }
  }

  @Post('users/:id/reset-password')
  @RequirePermission('admin.users.manage')
  async resetUserPassword(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: ReasonDto,
  ) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const result = await this.adminService.resetUserPassword(companyId, actorId, id, body.reason)
    return { success: true, data: result }
  }

  @Get('audit-logs')
  @RequirePermission('admin.audit.read')
  async auditLogs(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const items = await this.adminService.listAuditLogs(companyId)
    return { success: true, data: items }
  }

  @Patch('profile')
  async updateMyProfile(@Body() body: UpdateMyProfileDto) {
    const userId = requireUserId()
    const row = await this.adminService.updateMyProfile(userId, body)
    return { success: true, data: row }
  }

  // --- Print Templates & Settings ---
  @Get('print-templates')
  @RequirePermission('admin.settings.read')
  async getPrintTemplates(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const items = await this.adminService.listPrintTemplates(companyId)
    return { success: true, data: items }
  }

  @Post('print-templates')
  @RequirePermission('admin.settings.manage')
  async createPrintTemplate(@Headers('x-company-id') companyId: string | undefined, @Body() body: CreatePrintTemplateDto) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.createPrintTemplate(companyId, actorId, body)
    return { success: true, data: row }
  }

  @Patch('print-templates/:id')
  @RequirePermission('admin.settings.manage')
  async updatePrintTemplate(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdatePrintTemplateDto,
  ) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.updatePrintTemplate(companyId, actorId, id, body)
    return { success: true, data: row }
  }

  @Delete('print-templates/:id')
  @RequirePermission('admin.settings.manage')
  async deletePrintTemplate(
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id') id: string,
  ) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    await this.adminService.deletePrintTemplate(companyId, actorId, id)
    return { success: true }
  }

  @Get('print-settings')
  @RequirePermission('admin.settings.read')
  async getPrintSettings(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const items = await this.adminService.getPrintSettings(companyId)
    return { success: true, data: items }
  }

  @Post('print-settings')
  @RequirePermission('admin.settings.manage')
  async upsertPrintSettings(@Headers('x-company-id') companyId: string | undefined, @Body() body: UpsertPrintSettingsDto) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    const row = await this.adminService.upsertPrintSettings(companyId, actorId, body)
    return { success: true, data: row }
  }

  @Get('profile')
  async getProfile() {
    const userId = requireUserId()
    const profile = await this.adminService.getProfile(userId)
    return { success: true, data: profile }
  }

  @Get('rbac')
  @RequirePermission('admin.roles.manage')
  async getRBAC(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const snapshot = await this.adminService.getRbacSnapshot(companyId)
    return { success: true, data: snapshot }
  }

  @Patch('rbac')
  @RequirePermission('admin.roles.manage')
  async patchRBAC(@Headers('x-company-id') companyId: string | undefined, @Body() body: any) {
    if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'معرّف الشركة مطلوب' })
    const actorId = requireUserId()
    await this.adminService.patchRbac(companyId, actorId, body)
    return { success: true }
  }
}
