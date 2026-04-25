import { Body, Controller, Post, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { OnboardingService } from './onboarding.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { getTenantContext } from '../../common/tenant/tenant-context'

class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  phone!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: 'EGP' })
  @IsString()
  currency!: string

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  vatRate!: number

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  defaultBranchName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  defaultWarehouseName?: string
}

@Controller('onboarding')
export class OnboardingController {
  constructor(@Inject(OnboardingService) private readonly onboardingService: OnboardingService) {}

  @Post('company')
  async createCompany(@Body() body: CreateCompanyDto) {
    const { userId } = getTenantContext()
    if (!userId) {
      throw new UnauthorizedException('يجب تسجيل الدخول لإكمال إعداد الشركة')
    }
    const company = await this.onboardingService.createInitialCompany(
      {
        name: body.name,
        phone: body.phone,
        address: body.address,
        currency: body.currency,
        vatRate: body.vatRate,
        countryCode: body.countryCode,
        timezone: body.timezone,
        defaultBranchName: body.defaultBranchName,
        defaultWarehouseName: body.defaultWarehouseName,
      },
      userId,
    )
    return { success: true, data: company }
  }

  @Post('sample-data')
  async sampleData(@Body() body: { companyId?: string }) {
    const { userId } = getTenantContext()
    if (!userId) {
      throw new UnauthorizedException('يجب تسجيل الدخول لإضافة البيانات التجريبية')
    }

    let resolved = body.companyId
    if (!resolved) {
      try {
        resolved = requireCompanyId()
      } catch {
        /* JWT قد لا يحتوي companyId بعد الأونبوردينغ */
      }
    }
    if (!resolved) {
      resolved = (await this.onboardingService.getCompanyIdForUser(userId)) ?? undefined
    }
    if (!resolved) {
      throw new BadRequestException(
        'لم يُعثر على شركة مرتبطة بحسابك. أكمل خطوة «بيانات الشركة» ثم أعد المحاولة.',
      )
    }

    const summary = await this.onboardingService.setupSampleData(resolved)
    return { success: true, data: summary }
  }
}
