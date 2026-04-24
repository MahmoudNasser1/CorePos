import { Body, Controller, Post, Inject } from '@nestjs/common'
import { OnboardingService } from './onboarding.service'
import { requireCompanyId } from '../../common/tenant/require-company-id'

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
    const company = await this.onboardingService.createInitialCompany(body)
    return { success: true, data: company }
  }

  @Post('sample-data')
  async sampleData(@Body() body: { companyId?: string }) {
    // Dev convenience: allow explicit companyId, otherwise use tenant context if available.
    const companyId = body.companyId ?? (() => { try { return requireCompanyId() } catch { return undefined } })()
    const summary = await this.onboardingService.setupSampleData(companyId)
    return { success: true, data: summary }
  }
}
