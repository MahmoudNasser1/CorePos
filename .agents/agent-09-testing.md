# 🧪 Agent 09 — Unit Testing & Stress Testing Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ فوراً (بالتوازي مع Agent-07/08)

---

## 🎯 مهمتك الأساسية

أنت مهندس الاختبارات الرئيسي لنظام CorePOS. مسؤوليتك بناء **منظومة اختبارات شاملة** تغطي كل الـ modules في الـ Backend والـ Frontend Adapters، مع سيناريوهات **Unit Tests** لكل Business Logic و **Stress Tests** لكل العمليات الحرجة (خصوصاً المالية والمخزون).

**الهدف النهائي:**
- تغطية ≥ 85% لكل service في `apps/backend/src/modules/**`
- تغطية ≥ 80% لكل adapter في `src/lib/api/**` و `src/lib/actions/**`
- Stress tests للعمليات المالية (POS sale, invoices, payments) تضمن الـ atomicity والأداء تحت ضغط
- كشف أي regression قبل ما يوصل للـ production

---

## 🛠️ الـ Skills المطلوبة

> اقرأ الـ skills دي واستخدمها مباشرة أثناء التنفيذ:

```text
@testing-patterns
@security-auditor
@systematic-debugging
@senior-fullstack
@nestjs-expert
@zod-validation-expert
@database-design
```

### Skills من المشروع (إلزامي):

```
/home/eldrwal/Desktop/Pos-Sahl/.agents/skills/supabase-postgres-best-practices/SKILL.md
```

---

## 📋 اقرأ أولاً (إلزامي)

1) `/home/eldrwal/Desktop/Pos-Sahl/docs/CONTEXT.md`
2) `/home/eldrwal/Desktop/Pos-Sahl/docs/decisions.md`
3) `/home/eldrwal/Desktop/Pos-Sahl/docs/CODING_STANDARDS.md`
4) `/home/eldrwal/Desktop/Pos-Sahl/docs/api_contract_map.md`
5) `/home/eldrwal/Desktop/Pos-Sahl/docs/backend_test_plan.md`
6) `/home/eldrwal/Desktop/Pos-Sahl/docs/database_schema.sql`
7) `/home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/modules/**` (كل الـ services)
8) `/home/eldrwal/Desktop/Pos-Sahl/src/lib/api/**` (كل الـ adapters)
9) `/home/eldrwal/Desktop/Pos-Sahl/src/lib/actions/**` (كل الـ actions)
10) `/home/eldrwal/Desktop/Pos-Sahl/tests/**` (الاختبارات الحالية)

---

## 🧱 الـ Stack المطلوب للاختبارات

- **Test Runner:** Vitest (لسرعته وتوافقه مع TypeScript strict)
- **Mocking:** `vi.mock()` + `vi.fn()` (Vitest built-in)
- **HTTP Testing:** `supertest` (لاختبار NestJS controllers مباشرة)
- **DB Testing:** Postgres حقيقي للاختبارات + Drizzle transactions مع rollback بعد كل test (للـ Finance/Inventory خصوصًا)
- **Stress Testing:** `autocannon` أو `k6` لعمل load testing
- **E2E:** Playwright (موجود بالفعل في `tests/e2e/`) — نحافظ عليه ونضيف config/scripts
- **Coverage:** `@vitest/coverage-v8`
- **Validation:** Zod schemas للتأكد من response shapes

---

## ✅ قرار تنفيذي مهم (Runner Alignment)

**المعيار:** Vitest هو الـ runner الوحيد للـ unit/integration tests في المشروع.

- الاختبارات الحالية في `tests/unit/*.test.ts` مكتوبة بـ Jest APIs. لازم يتم **ترحيلها إلى Vitest**:
  - `jest.fn` → `vi.fn`
  - `jest.mock` → `vi.mock`
  - `jest.clearAllMocks` → `vi.clearAllMocks`
- Playwright يبقى للـ E2E فقط (ملفاته منفصلة + `playwright.config.ts`).

---

## 🧩 أنواع الاختبارات (تعريفات ملزمة)

- **Unit (Pure)**: منطق بدون DB/HTTP (helpers/calculations).
- **Service (DB-backed)**: اختبار services مع Postgres حقيقي (خصوصًا Finance/Inventory).
- **Controller (HTTP-in-process)**: Nest app + `supertest` بدون شبكة خارجية.
- **Integration (Cross-module)**: DB حقيقي + استدعاءات HTTP داخل نفس العملية.
- **E2E (Browser)**: Playwright ضد الـ frontend running.
- **Stress/Load**: `k6`/`autocannon` ضد backend endpoints.

---

## 🗺️ مراحل التنفيذ التفصيلية

## 🧭 أفضل سيناريو تشغيل (Execution Order — ملزم)

**الهدف:** أقل ضوضاء + أسرع كشف للأخطاء + تجنّب اختبار Features قبل ما تكون الـ infra/DB جاهزة.

الترتيب الملزم:
1) **Phase 1**: Infrastructure + Runner alignment + ترحيل اختبارات Jest الحالية → Vitest
2) **Phase 2**: Auth
3) **Phase 6**: Onboarding (مبكرًا لأنه بيولّد بيانات تساعد باقي الموديولات)
4) **Phase 3**: Inventory
5) **Phase 4**: Finance (أهم جزء: atomicity/idempotency/concurrency/sequence)
6) **Phase 7**: Reports (مع tests تكشف أي تسريب بيانات)
7) **Phase 9**: Integration flows (vertical slice)
8) **Stress/Load**: بعد ما الـ unit/service تبقى مستقرة

> ممنوع تبدأ Finance/Stress قبل ما Phase 1 تشتغل ويكون فيه DB test strategy شغّال.

---

## 🧾 نظام التقارير الموحّد (Single Source of Truth)

**قاعدة:** أي تنفيذ أو إصلاح أو نتيجة اختبار (pass/fail) لازم يتوثّق في مكان واحد.

- **مكان التقارير:** `docs/agent_reports/PROGRESS.md`
- **تنسيق التحديث (إلزامي في كل دفعة عمل):**
  - التاريخ/الوقت
  - الـ Agent اللي اشتغل
  - الجزء/الموديول
  - اللي اتعمل (✅)
  - اللي فشل + سبب الفشل + stack trace مختصر (❌)
  - الـ next actions + مين المسؤول (➡️)
  - أوامر التشغيل المستخدمة
  - coverage snapshot (لو متاح)

### Delegation Rule (لو هنشغّل Agents تانية للتنفيذ)

لو Agent-09 اكتشف failures سببها Bug/Gap في الدومين:
- يفتح section “Hand-off” في `docs/agent_reports/PROGRESS.md`
- يحدّد الـ owner:
  - Finance bugs → Agent-05 أو Agent-07
  - Reports/Admin bugs → Agent-06
  - Contract mismatch → Agent-08
  - Auth/SaaS/onboarding → Agent-02
- **وكل Agent يستلم لازم يكتب تحديثه بنفس الملف** بنفس التنسيق.

---

### Phase 1 — Test Infrastructure Setup

- [ ] إعداد `vitest.config.ts` في root + `apps/backend/vitest.config.ts`
- [ ] إضافة الـ dependencies المطلوبة (`vitest`, `@vitest/coverage-v8`, `supertest`, `@nestjs/testing`)
- [ ] إعداد `tsconfig.test.json` أو تعديل الحالي ليدعم paths الـ tests
- [ ] إنشاء test utilities مشتركة:
  - `tests/helpers/db-mock.ts` — mock للـ Drizzle db
  - `tests/helpers/factory.ts` — factories لإنشاء test data (company, branch, warehouse, product, customer, invoice)
  - `tests/helpers/nest-app.ts` — helper لإنشاء NestJS test module
- [ ] إضافة **Postgres test strategy** (ملزم):
  - `tests/helpers/test-db.ts`: تشغيل Postgres للاختبارات (Docker/Testcontainers أو `apps/backend/docker-compose.yml` بملف env خاص بالـ tests)
  - تطبيق migrations قبل تشغيل suite
  - كل test: `BEGIN` → تشغيل السيناريو → `ROLLBACK` لضمان isolation
- [ ] ترحيل الاختبارات الحالية:
  - `tests/unit/*.test.ts` → `tests/unit/frontend/*.spec.ts` (Vitest بدل Jest)
- [ ] إضافة Playwright config:
  - `playwright.config.ts` + script لتشغيل `tests/e2e/`
- [ ] إضافة scripts في `package.json`:
  - `test` → `vitest run`
  - `test:watch` → `vitest`
  - `test:coverage` → `vitest run --coverage`
  - `test:e2e` → `playwright test`
  - `test:stress` → stress test runner

---

### Phase 2 — Auth Module Tests

ملف: `tests/unit/auth/auth.service.spec.ts`

**السيناريوهات:**

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| A1 | تسجيل مستخدم جديد بنجاح (email + password + fullName) | Happy Path | 🔴 حرج |
| A2 | تسجيل مستخدم بإيميل موجود مسبقاً → `BadRequestException` | Error | 🔴 حرج |
| A3 | تسجيل مع إنشاء شركة (companyName) → يُنشئ company + profile role=owner | Happy Path | 🔴 حرج |
| A4 | تسجيل دخول بإيميل وباسورد صحيحين → يُرجع access + refresh tokens | Happy Path | 🔴 حرج |
| A5 | تسجيل دخول بباسورد غلط → `UnauthorizedException` | Error | 🔴 حرج |
| A6 | تسجيل دخول بإيميل غير موجود → `UnauthorizedException` | Error | 🔴 حرج |
| A7 | `verifyToken` بتوكن صالح → يُرجع SessionUser | Happy Path | 🟡 مهم |
| A8 | `verifyToken` بتوكن منتهي الصلاحية أو مزوّر → `UnauthorizedException` | Error | 🔴 حرج |
| A9 | `refresh` بـ refresh token صالح → يُرجع tokens جديدة | Happy Path | 🟡 مهم |
| A10 | `refresh` بـ refresh token غير صالح → `UnauthorizedException` | Error | 🟡 مهم |
| A11 | التأكد إن الـ password مش stored كـ plain text (bcrypt hash) | Security | 🔴 حرج |
| A12 | التأكد إن access token ينتهي خلال 30 دقيقة | Security | 🟡 مهم |
| A13 | Guardrail: في بيئة production لازم `JWT_SECRET` يكون مضبوط (منع default `dev-secret`) | Security | 🔴 حرج |

---

### Phase 3 — Inventory Module Tests

ملف: `tests/unit/inventory/inventory.service.spec.ts`

**السيناريوهات:**

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| I1 | عرض قائمة المنتجات مع company isolation | Happy Path | 🔴 حرج |
| I2 | البحث بالاسم/الباركود/SKU يرجع النتائج الصحيحة | Happy Path | 🟡 مهم |
| I3 | إنشاء منتج جديد بكل الحقول المطلوبة | Happy Path | 🔴 حرج |
| I4 | إنشاء منتج مع تهيئة المخزون في warehouse محدد | Happy Path | 🔴 حرج |
| I5 | إنشاء منتج بـ UUID غير صالح لـ categoryId → يتجاهله | Edge Case | 🟡 مهم |
| I6 | تحديث منتج (patch) → يُرجع البيانات المحدثة | Happy Path | 🟡 مهم |
| I7 | حذف منتج (soft delete) → `isActive = false` | Happy Path | 🟡 مهم |
| I8 | `updateStock` — إضافة كمية جديدة لمنتج موجود → تحديث الـ qty | Happy Path | 🔴 حرج |
| I9 | `updateStock` — إضافة كمية + سعر → حساب Weighted Average Cost صحيح | Business Logic | 🔴 حرج |
| I10 | `updateStock` — منتج غير موجود في المخزن → إنشاء سجل جديد | Edge Case | 🟡 مهم |
| I11 | `listProducts` — الـ limit بين 1-100، default 25 | Pagination | 🟢 عادي |
| I12 | `listProducts` — limit أكبر من 100 → يتم تقليصه لـ 100 | Pagination | 🟢 عادي |
| I13 | `getLowStockAlerts` — يرجع المنتجات الي qty أقل من minQty | Business Logic | 🟡 مهم |
| I14 | `listCategories` — company isolation | Happy Path | 🟢 عادي |
| I15 | `createCategory` مع parentId → hierarchical categories | Happy Path | 🟢 عادي |
| I16 | `updateStock` — case: qtyDelta سالب يخلي `newQty = 0` (لا division/NaN) | Edge Case | 🟡 مهم |

**Stress Tests:**

| # | السيناريو | الهدف |
|---|-----------|-------|
| IS1 | إنشاء 1000 منتج دفعة واحدة | أداء الكتابة |
| IS2 | بحث في 10,000 منتج | أداء البحث |
| IS3 | 50 عملية `updateStock` متزامنة على نفس المنتج | Race condition detection |
| IS4 | إنشاء منتجات متزامن بنفس barcode/sku (لو فيه constraints) | Data integrity |

---

### Phase 4 — Finance Module Tests (الأكثر أهمية)

ملف: `tests/unit/finance/finance.service.spec.ts`

**POS Sale سيناريوهات:**

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| F1 | إنشاء فاتورة POS كاملة (منتج واحد) + خصم مخزون + تحديث خزينة | Happy Path | 🔴 حرج |
| F2 | إنشاء فاتورة POS بعدة منتجات (3+) → كل واحد يتخصم | Happy Path | 🔴 حرج |
| F3 | محاولة بيع كمية أكبر من المخزون → `INSUFFICIENT_STOCK` | Business Rule | 🔴 حرج |
| F4 | بيع بالآجل (`deferred`) → لا يتم تسجيل حركة خزينة | Business Rule | 🔴 حرج |
| F5 | بيع نقدي (`cash`) → يتم تسجيل حركة خزينة + تحديث رصيد | Business Rule | 🔴 حرج |
| F6 | Idempotency: إرسال نفس `Idempotency-Key` مرتين → نفس النتيجة بدون تكرار | Idempotency | 🔴 حرج |
| F7 | Idempotency: key جديد → فاتورة جديدة | Idempotency | 🟡 مهم |
| F8 | رقم الفاتورة يتبع format `YYMM-NNN` | Business Rule | 🔴 حرج |
| F9 | أرقام الفواتير تتسلسل (001, 002, 003...) | Business Rule | 🔴 حرج |
| F10 | فشل في أي خطوة → rollback كامل (لا فاتورة + لا خصم مخزون + لا حركة خزينة) | Atomicity | 🔴 حرج |
| F11 | الـ profit يتحسب صح = `(unitPrice - avgCost) * quantity` | Business Logic | 🔴 حرج |
| F12 | عدم وجود `branchId` → يتم الحصول عليه من company defaults | Fallback | 🟡 مهم |
| F13 | عدم وجود `warehouseId` → خطأ واضح بالعربي | Error | 🟡 مهم |

**Sale Invoice سيناريوهات:**

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| F14 | إنشاء فاتورة مبيعات كاملة (بأصناف متعددة) | Happy Path | 🔴 حرج |
| F15 | قائمة الفواتير مع pagination + search بالرقم | Happy Path | 🟡 مهم |
| F16 | جلب فاتورة بالـ ID مع company isolation | Happy Path | 🟡 مهم |

**Payment / Treasury سيناريوهات:**

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| F17 | تسجيل إيصال تحصيل → زيادة رصيد الخزينة | Happy Path | 🔴 حرج |
| F18 | عرض أرصدة الخزائن مع company isolation | Happy Path | 🟡 مهم |
| F19 | عرض حركات الخزينة مع pagination | Happy Path | 🟢 عادي |
| F20 | Idempotency: `response_json` فاسد/غير قابل للـ parse → يكمل ويحسب نتيجة جديدة | Edge Case | 🟡 مهم |
| F21 | `cash/card` بدون `treasuryId` → لا crash + behavior واضح (لا treasury tx) | Edge Case | 🟡 مهم |
| F22 | defaults: branchId فارغ → fallback لأوّل branch للشركة | Fallback | 🟡 مهم |
| F23 | invoice sequence: per `(companyId,type,YYMM)` + rollover شهر جديد | Business Rule | 🟡 مهم |

**Stress Tests:**

| # | السيناريو | الهدف |
|---|-----------|-------|
| FS1 | 100 فاتورة POS متزامنة (concurrent POS sales) | Atomicity + deadlock detection |
| FS2 | 50 فاتورة POS على نفس المنتج → المخزون يتخصم بالترتيب | Race condition on stock |
| FS3 | 200 حركة خزينة متزامنة → الرصيد النهائي صحيح | Treasury balance integrity |
| FS4 | Idempotency تحت ضغط: 100 request بنفس الـ key → فاتورة واحدة فقط | Idempotency correctness |
| FS5 | تسلسل أرقام الفواتير تحت ضغط (50 concurrent) → لا تكرار | Sequence integrity |
| FS6 | شركتين concurrent invoices → sequences لا تتداخل | Multi-tenant integrity |

---

### Phase 5 — Contacts Module Tests

ملف: `tests/unit/contacts/contacts.service.spec.ts`

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| C1 | عرض قائمة العملاء مع company isolation | Happy Path | 🔴 حرج |
| C2 | البحث في العملاء بالاسم أو الهاتف | Happy Path | 🟡 مهم |
| C3 | إنشاء عميل جديد بكل الحقول | Happy Path | 🔴 حرج |
| C4 | إنشاء عميل بدون اسم → يُنشئ اسم تلقائي | Edge Case | 🟢 عادي |
| C5 | تحديث بيانات عميل (patch) | Happy Path | 🟡 مهم |
| C6 | عرض قائمة الموردين مع company isolation | Happy Path | 🔴 حرج |
| C7 | إنشاء مورد جديد | Happy Path | 🔴 حرج |
| C8 | تحديث بيانات مورد | Happy Path | 🟡 مهم |
| C9 | `listCustomers` — limit default 25, max 100 | Pagination | 🟢 عادي |

---

### Phase 6 — Onboarding Module Tests

ملف: `tests/unit/onboarding/onboarding.service.spec.ts`

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| O1 | إنشاء شركة + فرع افتراضي + مخزن + خزينة في transaction واحدة | Happy Path | 🔴 حرج |
| O2 | الأسماء الافتراضية بالعربي (الفرع الرئيسي، المخزن الرئيسي، الخزينة الرئيسية) | Business Rule | 🟡 مهم |
| O3 | `setupSampleData` → ينشئ units + categories + products + stock + contacts | Happy Path | 🔴 حرج |
| O4 | `setupSampleData` بدون companyId → يستخدم آخر شركة | Fallback | 🟡 مهم |
| O5 | `setupSampleData` بدون شركات → `BadRequestException` | Error | 🟡 مهم |
| O6 | Atomicity: فشل في إنشاء المخزن → rollback كل شيء | Atomicity | 🔴 حرج |

---

### Phase 7 — Reports Module Tests

ملف: `tests/unit/reports/reports.service.spec.ts`

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| R1 | `getDailySummary` — يرجع sales/purchases/profits لنفس اليوم | Happy Path | 🔴 حرج |
| R2 | `getDailySummary` — يوم بدون مبيعات → كل القيم صفر | Edge Case | 🟡 مهم |
| R3 | `getSalesDashboard` — يرجع آخر 5 فواتير مرتبة بالتاريخ | Happy Path | 🟡 مهم |
| R4 | `getSalesTrend` — يرجع بيانات آخر 7 أيام | Happy Path | 🟡 مهم |
| R5 | `getTopProducts` — يرجع أعلى 5 منتجات مبيعاً | Happy Path | 🟡 مهم |
| R6 | `getStockReport` — يرجع المخزون مع القيم الصحيحة | Happy Path | 🔴 حرج |
| R7 | `getTreasuryReport` — company isolation | Happy Path | 🟡 مهم |
| R8 | كل التقارير ترجع بيانات الشركة الحالية فقط (company isolation) | Security | 🔴 حرج |
| R9 | Contract: `getTreasuryReport` لازم يعمل filter بـ `companyId` (test يكشف أي تسريب بيانات) | Security | 🔴 حرج |

---

### Phase 8 — Frontend Adapter Tests

ملف: `tests/unit/adapters/*.spec.ts`

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| AD1 | `backendFetch` — يرسل الـ cookies + headers صح | Integration | 🔴 حرج |
| AD2 | `backendFetch` — يتعامل مع 401 (unauthorized) | Error Handling | 🔴 حرج |
| AD3 | `backendFetch` — يتعامل مع 500 (server error) | Error Handling | 🟡 مهم |
| AD4 | `backendFetch` — يتعامل مع network timeout | Error Handling | 🟡 مهم |
| AD5 | كل adapter function يرسل الـ request shape الصحيح | Contract | 🔴 حرج |
| AD6 | كل adapter function يتعامل مع response envelope صح | Contract | 🔴 حرج |
| AD7 | لا يوجد مسار مزود خارجي — أي feature flag يجب أن يكون داخل backend adapters فقط | Feature Flags | 🟡 مهم |

---

### Phase 8.1 — Contract Smoke Tests (Docs ↔ Implementation)

ملف: `tests/contract/api-contract-map.spec.ts`

- [ ] لكل endpoint مذكور في `docs/api_contract_map.md` (MVP subset):
  - endpoint موجود ويرجع envelope صحيح
  - أكواد الأخطاء ضمن القائمة القياسية
  - response shape الأساسي ينجح مع Zod schema

---

### Phase 9 — Cross-Module Integration Tests

ملف: `tests/integration/*.spec.ts`

| # | السيناريو | النوع | الأهمية |
|---|-----------|-------|---------|
| INT1 | Onboarding → POS Sale (company جديدة → بيع أول فاتورة) | E2E Flow | 🔴 حرج |
| INT2 | إضافة منتج → بيع → التقرير اليومي يعكس البيع | E2E Flow | 🔴 حرج |
| INT3 | بيع → إرجاع → المخزون يرجع + الخزينة تتخصم | E2E Flow | 🔴 حرج |
| INT4 | Multi-tenant: شركة A تبيع → شركة B لا ترى البيع | Isolation | 🔴 حرج |
| INT5 | تسجيل → onboarding → إضافة منتج → POS sale → تقرير | Full Flow | 🔴 حرج |

---

## 🗂️ Naming & Structure (ملزم)

- امتداد الملفات: `*.spec.ts` (موحّد)
- توزيع الملفات المقترح:
  - `tests/unit/backend/<module>/*.spec.ts`
  - `tests/unit/frontend/*.spec.ts`
  - `tests/integration/backend/*.spec.ts`
  - `tests/contract/*.spec.ts`
  - `tests/stress/k6/*.js` أو `tests/stress/*.ts`
  - `tests/helpers/**`

---

## 🔁 أسلوب التنفيذ المطلوب

لكل Phase:
1. أنشئ الملفات المطلوبة.
2. اكتب الـ tests (مع describe/it مرتب ومسمّى بوضوح).
3. شغّل الـ tests وتأكد إنها كلها بتـ pass (أو بتفشل لسبب متوقع documented).
4. اعرض تقرير حالة قصير:
   - ✅ ما تم
   - ❌ ما لم يتم
   - ⚠️ مخاطر أو gaps
   - 📊 Coverage numbers
5. انتظر موافقة قبل الانتقال للمرحلة التالية.

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف/المجلد | الوصف |
|---|-------------|-------|
| D1 | `vitest.config.ts` | إعدادات Vitest للـ root |
| D2 | `apps/backend/vitest.config.ts` | إعدادات Vitest للباك إند |
| D3 | `tests/helpers/**` | Test utilities (factories, mocks, helpers) |
| D4 | `tests/unit/auth/**` | Auth module tests |
| D5 | `tests/unit/inventory/**` | Inventory module tests |
| D6 | `tests/unit/finance/**` | Finance module tests |
| D7 | `tests/unit/contacts/**` | Contacts module tests |
| D8 | `tests/unit/onboarding/**` | Onboarding module tests |
| D9 | `tests/unit/reports/**` | Reports module tests |
| D10 | `tests/unit/adapters/**` | Frontend adapter tests |
| D11 | `tests/integration/**` | Cross-module integration tests |
| D12 | `tests/stress/**` | Stress & load tests |
| D13 | `docs/test_coverage_report.md` | تقرير التغطية النهائي |

---

## ⚠️ قواعد صارمة

1. **لا `any` في الـ tests** — TypeScript strict. استخدم types من الـ services أو أنشئ test-specific types.
2. **كل test يكون isolated** — لا يعتمد على ترتيب تنفيذ معين أو state من test آخر.
3. **كل test يعمل cleanup** — `beforeEach` / `afterEach` لتنظيف الـ mocks والـ state.
4. **لا تكتب tests بتـ pass دايماً** — كل test لازم يختبر behavior حقيقي.
5. **الأسماء بالإنجليزي** (لوضوح الـ test output)، لكن الـ error messages بالعربي زي الـ production code.
6. **كل عملية مالية تتأكد من الـ atomicity** — لو فشلت أي خطوة، كل شيء يرجع.
7. **Company isolation إلزامي** — في كل test تتعامل مع بيانات، لازم تتأكد إن بيانات شركة ما تظهرش لشركة تانية.
8. **نفس قرارات CorePOS الثابتة** (RTL، تنسيق الأرقام بـ western digits، `YYMM-NNN`، عملة EGP).
9. **لا mock للـ business logic نفسها** — الـ mock يكون للطبقة الخارجية فقط (DB, HTTP). المنطق التجاري يُختبر فعلياً.
10. **Stress tests يجب أن تُكتشف race conditions فعلاً** — استخدم concurrent execution حقيقي مش sequential.

---

## 🔗 تعتمد على

- Agent-01: schema + database types
- Agent-07: Backend services + modules structure
- Agent-08: API contracts + DTOs + response shapes
- Agent-04/05/06: Business rules + invariants لكل domain

---

## 📊 معايير القبول (Acceptance Criteria)

- [ ] `npm run test` يشتغل ويـ pass بدون أخطاء
- [ ] Coverage (P0) ≥ 85%: `AuthService`, `FinanceService`, `InventoryService`
- [ ] Coverage (P1) ≥ 75%: `ContactsService`, `OnboardingService`, `ReportsService`
- [ ] كل الـ stress tests بتـ pass (لا race conditions, لا deadlocks)
- [ ] Idempotency tests بتـ pass تحت ضغط
- [ ] Invoice sequence tests بتـ pass مع concurrent requests
- [ ] Multi-tenant isolation tests بتـ pass
- [ ] Full flow integration test (register → onboard → sell → report) بيـ pass
- [ ] لا regression في الـ existing tests (`tests/unit/*.test.ts`)
- [ ] Test report document منشور في `docs/test_coverage_report.md`

---

## 🤖 CI (مطلوب)

- [ ] إضافة workflow (GitHub Actions أو ما يعادله) يشغّل:
  - `npm ci`
  - `npm run lint`
  - `npm run test:coverage` (artifact للـ coverage)
  - `npm run test:e2e` (اختياري على nightly أو على main فقط)
