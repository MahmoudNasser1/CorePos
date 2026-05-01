import { Module } from '@nestjs/common'
import { BillingController } from './billing.controller'
import { BillingWebhookController } from './billing-webhook.controller'
import { BillingService } from './billing.service'
import { PolicyEvaluatorService } from '../../common/rbac/policy-evaluator.service'

@Module({
  controllers: [BillingController, BillingWebhookController],
  providers: [BillingService, PolicyEvaluatorService],
  exports: [BillingService],
})
export class BillingModule {}

