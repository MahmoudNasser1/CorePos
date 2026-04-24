import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { HealthController } from './modules/health/health.controller'
import { AdminController } from './modules/admin/admin.controller'
import { TenantMiddleware } from './common/tenant/tenant.middleware'
import { CorsMiddleware } from './common/middleware/cors.middleware'

// Feature Modules
import { AuthModule } from './modules/auth/auth.module'
import { OnboardingModule } from './modules/onboarding/onboarding.module'
import { FinanceModule } from './modules/finance/finance.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { ContactsModule } from './modules/contacts/contacts.module'
import { ReportsModule } from './modules/reports/reports.module'

@Module({
  imports: [
    AuthModule,
    OnboardingModule,
    FinanceModule,
    InventoryModule,
    ContactsModule,
    ReportsModule,
  ],
  controllers: [
    HealthController,
    AdminController,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*')
      .apply(TenantMiddleware)
      .forRoutes('*path')
  }
}
