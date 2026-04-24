# 🧪 CorePOS — Test Coverage Report

> **ملاحظة:** هذا التقرير سيتوسع تدريجيًا مع تقدم تغطية الاختبارات.  
> التغطية الحالية تركز على **Backend (NestJS + Drizzle)** واختبارات DB-backed.

## ✅ What's covered now

- **Backend DB-backed tests (Vitest)**:
  - `AuthService`: register/login/session/refresh + production guardrail
  - `OnboardingService`: createInitialCompany + setupSampleData
  - `InventoryService`: list/search/create/updateStock (weighted avg) + low-stock
  - `FinanceService`: POS sale + atomicity + idempotency + invoice sequencing + payment receipt
  - `ReportsService`: daily/stock/treasury reports + isolation leak check
  - **Integration flow**: onboarding→inventory→POS sale→reports + multi-tenant isolation
- **Contract smoke (runtime script)**:
  - Auth + Onboarding + POS sale (build+run backend ثم HTTP asserts)
- **Stress/Load**:
  - POS sale load test (autocannon, runtime backend)

## 🧪 How to run

### Backend unit/service/integration (db-backed)

```bash
TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend
```

### Backend contract smoke (runtime)

```bash
TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run contract:smoke --workspace @pos-sahl/backend
```

### Stress test (POS sale)

```bash
TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run stress:pos-sale --workspace @pos-sahl/backend
```

## 📊 Stress snapshot (POS sale)

- **Requests**: 843 requests / 10.05s
- **Avg latency**: ~299ms
- **p50**: ~275ms
- **p97.5**: ~713ms
- **p99**: ~820ms
- **Errors**: 0
- **Non-2xx**: 0

## 📌 Next coverage milestones

- Enable `apps/backend` coverage and track thresholds per service.
- Add CI workflow to run:
  - `npm run lint`
  - `npm run test --workspace @pos-sahl/backend`
  - `npm run test:coverage --workspace @pos-sahl/backend`

## 📊 Backend coverage snapshot (Vitest v8)

- **All files**: 58.99% lines / 58.70% branches / 32.88% functions
- **Auth**:
  - `auth.service.ts`: 87.5% lines
- **Onboarding**:
  - `onboarding.service.ts`: 95.23% lines
- **Inventory**:
  - `inventory.service.ts`: 68.78% lines
- **Finance**:
  - `finance.service.ts`: 60.3% lines

> سيتم رفع التغطية للوصول لمعايير القبول (≥ 85% للخدمات الحرجة) ضمن p11، بزيادة الاختبارات على الفروع غير المغطاة (controllers + edge cases).

