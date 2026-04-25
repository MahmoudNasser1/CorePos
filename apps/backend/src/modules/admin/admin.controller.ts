import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { AdminService } from './admin.service'

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
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('companies')
  companies() {
    return { success: true, data: [] }
  }

  @Get('branches')
  async branches(@Headers('x-company-id') companyId?: string) {
    const items = companyId ? await this.adminService.listBranches(companyId) : []
    return { success: true, data: items }
  }

  @Post('branches')
  async createBranch(@Headers('x-company-id') companyId: string | undefined, @Body() body: CreateBranchDto) {
    const row = companyId ? await this.adminService.createBranch(companyId, body) : null
    return { success: true, data: row }
  }

  @Get('warehouses')
  async warehouses(@Headers('x-company-id') companyId?: string) {
    const items = companyId ? await this.adminService.listWarehouses(companyId) : []
    return { success: true, data: items }
  }

  @Get('company')
  async company(@Headers('x-company-id') companyId?: string) {
    const item = companyId ? await this.adminService.getCompany(companyId) : null
    return { success: true, data: item }
  }

  @Post('company')
  async updateCompany(@Headers('x-company-id') companyId: string | undefined, @Body() body: UpdateCompanyDto) {
    const item = companyId ? await this.adminService.updateCompany(companyId, body) : null
    return { success: true, data: item }
  }

  @Get('users')
  async users(@Headers('x-company-id') companyId?: string) {
    const items = companyId ? await this.adminService.listUsers(companyId) : []
    return { success: true, data: items }
  }

  @Get('audit-logs')
  auditLogs() {
    return { success: true, data: [] }
  }
}
