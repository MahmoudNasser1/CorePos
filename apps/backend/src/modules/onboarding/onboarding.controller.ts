import { Body, Controller, Post, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { OnboardingService } from './onboarding.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'
import { getTenantContext } from '../../common/tenant/tenant-context'

type CreateCompanyDto = {
  name: string
  phone: string
  address?: string
  currency: string
  vatRate: number
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
    const company = await this.onboardingService.createInitialCompany(body, userId)
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
