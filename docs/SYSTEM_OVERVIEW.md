# CorePOS (Pos-Sahl) — System Overview

> وثيقة عامة تلخّص النظام: المعمارية، التشغيل المحلي، الاختبارات، الـAPI، الأمان/التينانسي، المراقبة، واستعداد الإطلاق.
>
> **ملاحظة أمنية:** يوجد ملف محلي `RESOURCES.md` يحتوي إعدادات/بيانات تشغيل حساسة. لا تنسخ محتواه إلى مستندات عامة أو PRs.

---

## ### 1) High-level architecture

- **Frontend**: Next.js (واجهة المستخدم + Server Actions)
- **Backend**: NestJS API (Global prefix: `/v1`)
- **Database**: PostgreSQL (Drizzle ORM + SQL migrations)
- **E2E**: Playwright (تشغيل backend+frontend تلقائياً أثناء الاختبار)

---

## ### 2) Local run (developer workflow)

### Backend
- Workspace: `apps/backend`
- أهم أوامر التشغيل/التحقق:
  - `npm run test --workspace @pos-sahl/backend`
  - `npm run test:coverage --workspace @pos-sahl/backend`
  - `npm run contract:smoke --workspace @pos-sahl/backend`
  - `npm run security:smoke --workspace @pos-sahl/backend`
  - `npm run stress:pos-sale --workspace @pos-sahl/backend`

### Frontend + Backend together (E2E)
- `npm run test:e2e`
- يتم الاعتماد على `playwright.config.ts` لتشغيل الخدمات المطلوبة عبر `webServer`.

---

## ### 3) API conventions (contract)

- **Base prefix**: `/v1`
- **Error envelope** (عند الفشل):
  - `success: false`
  - `error: { code, message, details }`
  - `details` تشمل `requestId` عند توفره.

---

## ### 4) Tenancy & Security model

### Session enforcement
- تم فرض وجود session/cookies على المسارات الحسّاسة عبر:
  - `apps/backend/src/common/middleware/session-required.middleware.ts`

### Tenant context source (production)
- في production: تجاهل `x-company-id` / `x-user-id` / `company_id` cookie واعتماد الـtenant من JWT الموثّق فقط:
  - `apps/backend/src/common/tenant/tenant.middleware.ts`

### Runtime security verification
- سكربت smoke يثبت:
  - منع الوصول بدون session
  - منع bypass عبر headers في production
  - منع cross-tenant access/leakage عبر finance/inventory/reports/contacts
  - `apps/backend/tests/security/security-smoke.ts`

---

## ### 5) Observability & logging (minimum baseline)

### Request ID / Correlation
- middleware يضيف/يمرّر `x-request-id` ويضع `rid=...` في اللوجز:
  - `apps/backend/src/common/middleware/request-id.middleware.ts`

### Access logs
- Interceptor يكتب access logs عبر Nest `Logger`:
  - `apps/backend/src/common/interceptors/logging.interceptor.ts`

### Error logs + API error response
- Global filter يطبع error server-side عبر `Logger`، ويضيف `requestId` في تفاصيل الاستجابة:
  - `apps/backend/src/common/filters/http-exception.filter.ts`

---

## ### 6) Reliability under load (stress)

### Stress runner (POS sale)
- سكربت يزرع بيانات أساسية ثم يشغّل autocannon على `/v1/finance/pos-sale` ويُفشل التشغيل إذا ظهر errors/non-2xx:
  - `apps/backend/tests/stress/pos-sale-stress.ts`

### Percentiles note (p95)
- autocannon عادة يوفّر `p90 / p97.5 / p99` (وليس p95 افتراضياً).
- حالياً نوثّق `p90 + p97.5 + p99` كبديل، أو نستبدل الأداة لو p95 إلزامي قبل Commercial.

---

## ### 7) E2E status (Pilot)

- الملف الأساسي:
  - `tests/e2e/full_user_journey.spec.ts`
- **Pilot limitation**:
  - مسار POS sale في E2E مُحاكى لأن شاشة POS الحالية تعتمد على `MOCK_PRODUCTS` وليست مربوطة end-to-end بمخزون/خزينة فعلية في DB.
  - راجع `docs/release_readiness.md` لقيد الـPilot.

---

## ### 8) Release readiness status (current)

### Decision
- راجع: `docs/release_readiness.md`
- الحالة الحالية: **✅ Pilot Ready**

### Evidence & tracking
- Checklist التنفيذ: `docs/agent_reports/AGENT-10-CHECKLIST.md`
- سجل التنفيذ/الأدلة: `docs/agent_reports/PROGRESS.md`
- المخاطر/التخفيف: `docs/agent_reports/RISKS.md`
- handoffs: `docs/agent_reports/HANDOFFS.md`

---

## ### 9) What’s next for Commercial Ready

- Soak test 10–15 دقيقة + thresholds موثقة
- Real E2E POS sale بدون mock بعد ربط POS UI ببيانات فعلية بدل `MOCK_PRODUCTS`
- تحسين observability policy (مستويات log/PII) حسب بيئة التشغيل (dev/staging/prod) إذا احتجنا تشدد إضافي

