import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { HealthController } from './modules/health/health.controller'
import { AdminController } from './modules/admin/admin.controller'
import { TenantMiddleware } from './common/tenant/tenant.middleware'
import { CorsMiddleware } from './common/middleware/cors.middleware'
import { SessionRequiredMiddleware } from './common/middleware/session-required.middleware'
import { RequestIdMiddleware } from './common/middleware/request-id.middleware'

// Feature Modules
import { AuthModule } from './modules/auth/auth.module'
import { OnboardingModule } from './modules/onboarding/onboarding.module'
import { FinanceModule } from './modules/finance/finance.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { ContactsModule } from './modules/contacts/contacts.module'
import { ReportsModule } from './modules/reports/reports.module'
import { AdminModule } from './modules/admin/admin.module'
import { PosModule } from './modules/pos/pos.module'
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module'

@Module({
  imports: [
    AuthModule,
    OnboardingModule,
    FinanceModule,
    InventoryModule,
    ContactsModule,
    ReportsModule,
    AdminModule,
    PosModule,
    PlatformAdminModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL })
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL })
      .apply(SessionRequiredMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL })
      .apply(TenantMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL })
  }
}
