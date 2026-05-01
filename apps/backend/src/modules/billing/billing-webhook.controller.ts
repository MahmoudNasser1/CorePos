import { Controller, Post, Body, Logger } from '@nestjs/common'
import { BillingService } from './billing.service'

@Controller('billing/webhooks')
export class BillingWebhookController {
  private readonly logger = new Logger(BillingWebhookController.name)

  constructor(private readonly billingService: BillingService) {}

  @Post('paymob')
  async handlePaymob(@Body() body: any) {
    this.logger.log('Received Paymob webhook')
    
    // Logic for Paymob transaction data object
    // Paymob sends transaction data in body.obj if it's a transaction success/failure event
    const payload = body.type === 'TRANSACTION' ? body.obj : body
    
    await this.billingService.handleWebhook(payload)
    
    return { success: true }
  }
}
