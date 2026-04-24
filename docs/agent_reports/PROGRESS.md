# 📌 CorePOS — Agent Progress (Single Source of Truth)

> **الهدف:** ملف واحد نتابع منه “مين عمل إيه” و“إيه اللي اتعطل وليه” عبر كل الـ Agents.
>
> **قاعدة إلزامية:** أي Agent ينجز شغل (tests/bugs/contracts/infra) لازم يضيف تحديث هنا.

---

## 🧾 Update Template (انسخ/الصق)

### YYYY-MM-DD HH:MM (Local)
- **Agent**: Agent-XX
- **Area**: (Auth / Onboarding / Inventory / Finance / Reports / Infra / Contract / Stress / E2E)
- **Status**: (in_progress / blocked / done)

- **✅ Done**
  - ...
- **❌ Failed / Issues**
  - Issue: ...
  - Suspected cause: ...
  - Evidence (short): ...
- **➡️ Next**
  - Action: ...
  - Owner: Agent-XX
- **🧪 Commands**
  - `...`
- **📊 Coverage**
  - Lines: ...
  - Functions: ...
  - Branches: ...

---

## 📦 Current Hand-offs

> لما Agent-09 يسلّم Bug/Gap لAgent تاني، يتسجل هنا لحد ما يتقفل.

- **[OPEN]** ...

---

## 🗓️ Updates Log

<!-- Updates go below. Keep newest on top. -->

### 2026-04-25 (Local) — دفعة 09 Contacts
- **Agent**: Agent-11
- **Area**: UI-UX / Customers & Suppliers (خطة `09`)
- **Status**: done

- **✅ Done**
  - `PartnerTable`: عمود `kind`؛ بحث اسم/هاتف مع `useDeferredValue`؛ رصيد `tabular-nums` و`destructive` للمدين فقط؛ `DataTable` بدون شريط داخلي مزدوج؛ `emptyState`؛ `aria-label` لزر القائمة؛ اتجاه RTL للقائمة.
  - `PartnerStatement`: فلاتر تاريخ (مسودة + تطبيق + تصفير)؛ بحث في البيان؛ تسميات نوع الحركة عربية؛ تخفيف ألوان الجدول.
  - صفحات القوائم: عناوين «العملاء» / «الموردون»؛ إطارات لونية متناظرة؛ `isCurrency` للإجماليات المالية؛ أزرار إضافة معطّلة إلى حين المسار.
  - صفحات التفاصيل: بطاقة رصيد كبيرة؛ روابط سريعة (مبيعات/قبض — مشتريات/صرف)؛ إطار لوني متناسق مع القائمة.
  - توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 07 Purchases
- **Agent**: Agent-11
- **Area**: UI-UX / Purchases (خطة `07`)
- **Status**: done

- **✅ Done**
  - إصلاح **اختيار المورد** في `InvoiceForm` لأنواع `purchase_order` و`purchase_return` (كان يُحفَظ كعميل).
  - تحقق Zod: إلزام **المورد** لمسارات الشراء مع رسالة «اختر المورد أولًا» وعرض الخطأ تحت الحقل.
  - **مرتجع مشتريات**: `AlertDialog` بتأكيد واضح؛ بعد النجاح `toast` مخصص و`router` إلى قائمة المرتجعات.
  - تمييز بصري خفيف (`amber` + حد جانبي) لصفحات قوائم المشتريات؛ `PageHeader` لأوامر الشراء والمرتجعات وإنشاء أمر/مرتجع؛ نصوص إرشادية لدورة أمر الشراء.
  - `InvoiceStatusBadge`: حالة `received` → «مستلمة».
  - توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 08 Finance / Treasury
- **Agent**: Agent-11
- **Area**: UI-UX / Finance (خطة `08`)
- **Status**: done

- **✅ Done**
  - إزالة `"use server"` الخاطئ من `finance/treasuries/page.tsx` واستخدام `PageHeader`.
  - `TreasuryList`: رصيد بـ `CurrencyDisplay` و`text-2xl`؛ إصلاح نصوص «خزينة»؛ إزالة عرض UUID؛ أيقونات نوع بألوان هادئة.
  - `TreasuryTransactionsPanel` + تحديث `finance/treasury`: فلتر تاريخ؛ `StatCard` مع `isCurrency`؛ عنوان أوضح.
  - `TreasuryTable`: أعمدة وارد/صادر ورصيد بعدها؛ شارة مصدر `outline`؛ بحث في البيان؛ حالة فارغة عربية.
  - `VoucherForm`: combobox طرف؛ مبلغ LTR + `tabular-nums`؛ Select خزينة/طريقة متحكم بها؛ رسائل Zod وtoast موحّدة.
  - `ExpenseForm` + صفحة المصروفات: تنسيق عملة؛ نص فارغ؛ إزالة زر تصفية وهمي؛ تباين ألوان أهدأ في البطاقات.
  - توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 06 Sales / Invoices
- **Agent**: Agent-11
- **Area**: UI-UX / Sales (خطة `06`)
- **Status**: done

- **✅ Done**
  - `InvoiceTable`: بحث + من/إلى تاريخ + حالة؛ Sheet فلاتر للموبايل؛ `InvoiceStatusBadge`؛ `emptyState` وروابط إنشاء حسب النوع؛ تأكيد قبل تحويل عرض السعر؛ «إصدار فاتورة»؛ إصلاح نوع `purchase_return` في صفحة مرتجعات المشتريات.
  - `DataTable`: `showToolbar` / `showPagination`؛ ترقيم صفحات عربي؛ رأس `sticky`؛ تعطيل بحث الجدول الداخلي عند غياب `searchKey`.
  - `InvoiceForm`: ملخص `muted/40` مع `formatCurrency`؛ زر «إضافة بند» + منتقي يُفتح بتحكم؛ رسائل تحقق عربية؛ عرض إجمالي السطر بعملة.
  - `ProductSearchInput`: `useDeferredValue` + تصفية يدوية لتخفيف إعادة الرسم.
  - `InvoicePaymentDialog`: تنسيق المتبقي؛ toast محدّث؛ `router.refresh`.
  - `InvoicePrint`: حدود أقسام؛ `page-break-inside: avoid`؛ تذييل عربي؛ محاذاة RTL أوضح للجدول.
  - `PrintPageButton` + تحديث صفحة تفاصيل فاتورة المبيعات؛ `sales/new` بنص يفرق عن POS؛ `DashboardChrome` بـ `print:ps-0`.
  - توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 05 Inventory
- **Agent**: Agent-11
- **Area**: UI-UX / Inventory (خطة `05`)
- **Status**: done

- **✅ Done**
  - ثابت `INVENTORY_LOW_STOCK_THRESHOLD` في `src/lib/inventory-ui.ts` مع ربط الشارات والفلاتر.
  - `ProductsTableWithFilter`: فلتر فئة + حالة مخزون (منخفض ≤5 / كافٍ) مع `DataTable` وبحث.
  - `DataTable`: بحث RTL (`ps-10`)، `min-w` للجدول، حالة فارغة قابلة للتخصيص + زر إضافة، `aria-label` لتصدير.
  - `ProductColumns`: `tabular-nums`، نص تأكيد الحذف، أيقونات `me-2`.
  - `ProductForm`: شريط حفظ لزج سفلي، `inputMode="decimal"`، عنوان «المخزون والحدود»، `aria-busy`.
  - صفحة التفاصيل: منطق مخزون منخفض أوضح، `formatCurrency`، خط زمني بحدود منطقية، تحسينات وصولية خفيفة.
  - توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 04 POS
- **Agent**: Agent-11
- **Area**: UI-UX / POS (خطة `04-pos`)
- **Status**: done

- **✅ Done**
  - شبكة المنتجات: placeholder عربي، تمييز مطابقة الاسم، بطاقات غير متوفرة (`opacity` + شارة + تعطيل)، `formatCurrency`، أيقونة صندوق موحّدة.
  - الباركود: عدم التقاط الماسح داخل حقول الإدخال؛ رسائل toast عربية أوضح عند عدم العثور/الشبكة.
  - المتجر: سقف الكمية من `stock` + toast «الكمية المتاحة»؛ منع إضافة صنف نافد.
  - السلة: نسخة فارغة من الدليل، `formatCurrency`، `aria-label` لأزرار الحذف/التعليق/الكمية.
  - الدفع: عنوان «دفع الفاتورة»، إصلاح تعطيل الزر (أولوية العوامل)، منع الإرسال المزدوج، `aria-busy`، إزالة الطباعة التلقائية بعد البيع.
  - السلال المعلقة: `AlertDialog` للحذف، نص «سيتم حذف السلة نهائيًا»، `onOpenChange` صحيح، «استئناف».
  - الإيصال: `formatCurrency` + `tabular-nums` + إزالة نصوص إنجليزية؛ `print:hidden` على واجهة POS.
  - إضافة توثيق في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local) — دفعة 02
- **Agent**: Agent-11
- **Area**: UI-UX / Auth + Onboarding + Billing (خطة `02`)
- **Status**: done

- **✅ Done**
  - تسجيل الدخول: رسائل تحقق عربية، `autoComplete`، `aria-busy`، «جاري تسجيل الدخول…»، تمييز شبكة/401، رابط نسيت كلمة المرور تحت الزر، تنبيهات `role="alert"` بلا نص أبيض على أحمر.
  - التسجيل: `max-w-md`، تلميح قصير لكلمة المرور، `BackendApiError` للرسائل، نجاح أقرب لدليل المنتج.
  - نسيت كلمة المرور: صياغة T2.9، نجاح موحّد بعد الطلب (عدا أخطاء الشبكة).
  - الإعداد: تصحيح «ضريبة»، نصوص خطوات أوضح، رجوع من المخزن للشركة ومن العينات للمخزن، `aria-busy` وأخطاء أنعم.
  - الفوترة: `expired` عنوان/وصف؛ `history` empty state؛ إزالة `uppercase` من شارة الحالة في `billing`.
  - الهيدر: فتح لوحة الأوامر بحديث لوحة مفاتيح واحد (⌘ على Apple / Ctrl غير ذلك).
  - توثيق `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 (Local)
- **Agent**: Agent-11
- **Area**: UI-UX / Shell + Cross-cutting (خط الأنابيب: `13` ثم `01`)
- **Status**: done

- **✅ Done**
  - تنفيذ **T1.1** (تجميع روابط الشريط في أقسام) عبر `src/components/layout/dashboard-nav-items.ts` ومشاركة البيانات مع الشريط ودرج الموبايل.
  - تنفيذ **T1.4**: `DashboardChrome` + `Sheet` للتنقل على `< md` مع `aria-label` لزر القائمة وإغلاق بعد التنقل.
  - ربط **تسجيل الخروج** في تذييل الشريط بنفس مسار الهيدر.
  - **T13** RTL/طباعة: `border-e`، `ms-auto`، `lg:ps-72`، إصلاح `hover:translate-l-1` غير الصالح، `print:hidden` على الهيدر/الشريط، `@media print` في `globals.css`.
  - **T1.10**: إضافة `dashboard/loading.tsx` (Skeleton).
  - **T1.11** microcopy: تحديث `dashboard/error.tsx` (عنوان «تعذّر تحميل الصفحة» + `text-start` للـ dev block).
  - **T1.12**: `Toaster` مع `richColors={false}` لتقليل الصراخ البصري.
  - **CommandMenu** + **Sheet**: `me-2` للأيقونات، `ms-auto` للعنوان الفرعي، زر إغلاق عربي + `end-4`، تنظيف imports غير المستخدمة.
  - توثيق في `docs/ui_ux_audit.md`.
- **❌ Failed / Issues**
  - لا يوجد.
- **➡️ Next**
  - متابعة الخطة: **02-auth-onboarding-billing** أو تعميق **13** (grep أوسع لـ `ml-`/`mr-` خارج layout).
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-25 00:35 (Local)
- **Agent**: Agent-11
- **Area**: UI-UX / تخطيط
- **Status**: done

- **✅ Done**
  - توسيع حزمة الخطط `../plans/ui-ux-modules/`: إضافة [00-design-principles.md](../plans/ui-ux-modules/00-design-principles.md) (مبادئ **احترافي وبسيط** — هرمية، تباعد، ألوان، حالات، RTL، microcopy).
  - تفصيل الملفات `01`–`13`: تدفقات مستخدم، تسكات فرعية، جداول **نعم/لا**، **نسخ جاهز** عربي، معايير قبول مرتبطة بكل موديول.
  - تحديث [00-README.md](../plans/ui-ux-modules/00-README.md) (ربط مبادئ التصميم + ترتيب التنفيذ).
- **❌ Failed / Issues**
  - لا يوجد.
- **➡️ Next**
  - تنفيذ مراجعة UI فعليًا موديولًا موديولًا وتوثيق `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - لا ينطبق (وثائق فقط).

### 2026-04-25 00:10 (Local)
- **Agent**: Agent-11
- **Area**: UI-UX / تخطيط المراجعة
- **Status**: done

- **✅ Done**
  - إضافة حزمة خطط عربية كاملة «موديول موديول» لمراجعة UI/UX: المجلد `docs/plans/ui-ux-modules/` يتضمن:
    - `00-README.md` (منهجية، مراجع المهارات من Agent-11، فهرس، ترتيب تنفيذ، تعريف الإغلاق)
    - ملف خطة لكل موديول: `01` … `13` (أهداف، تسكات checkbox، معايير قبول، مخرجات)
- **❌ Failed / Issues**
  - لا يوجد.
- **➡️ Next**
  - تنفيذ المراجعة حسب ترتيب `00-README.md` وتوثيق النتائج في `docs/ui_ux_audit.md`.
- **🧪 Commands**
  - لا ينطبق (وثائق فقط).

### 2026-04-24 23:55 (Local)
- **Agent**: Agent-11
- **Area**: Inventory / UI-UX
- **Status**: done

- **✅ Done**
  - Created executable UI/UX audit log: `docs/ui_ux_audit.md` (with initial inventory findings + fixed status).
  - Inventory products table:
    - Improved A11y for row actions icon button (`aria-label`, `aria-hidden` icons).
    - Replaced `window.confirm` with consistent RTL `ConfirmDialog` + loading state to avoid repeated delete actions.
  - Product details page: removed English label `(Min Qty)` → Arabic-only "حد الطلب الأدنى".
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Continue Phase E (Inventory) audit: loading/empty states, responsive table behavior at 768px, low-stock indicator semantics vs `min_qty`.
  - Owner: Agent-11
- **🧪 Commands**
  - `npm run lint`
  - `npx tsc --noEmit`

### 2026-04-24  (Local)
- **Agent**: Agent-10
- **Area**: Release Readiness / Orchestration
- **Status**: in_progress

- **✅ Done**
  - Added Agent-10 checklist file: `docs/agent_reports/AGENT-10-CHECKLIST.md`.
  - Added reporting stubs: `docs/agent_reports/RISKS.md`, `docs/agent_reports/HANDOFFS.md`.
  - Ran baseline readiness commands successfully:
    - `npm run test:coverage --workspace @pos-sahl/backend` (PASS) — All files lines 58.99%
    - `npm run contract:smoke --workspace @pos-sahl/backend` (PASS)
    - `npm run stress:pos-sale --workspace @pos-sahl/backend` (PASS) — p50 138ms / p99 689ms
    - `npm run test` (PASS)
  - Implemented and verified E2E full journey (Playwright):
    - Added `tests/e2e/full_user_journey.spec.ts`
    - Updated Playwright config to use system Chrome + auto-start backend/frontend web servers
    - `npm run test:e2e` result: 1 passed / 1 skipped (legacy)
  - Fixed backend report query bug: `GET /v1/reports/top-products` no longer orders by missing alias.
  - Security/Tenancy hardening:
    - Added `SessionRequiredMiddleware` to enforce session cookie on sensitive routes (prod-safe; dev header bypass only outside prod).
    - Updated `TenantMiddleware` to ignore `x-company-id`/`x-user-id` and `company_id` cookie in production.
    - Added runtime security smoke script: `apps/backend/tests/security/security-smoke.ts` + `npm run security:smoke --workspace @pos-sahl/backend` (PASS).
    - Expanded security smoke to cover reports + contacts leakage checks (PASS).
  - Observability baseline:
    - Added `RequestIdMiddleware` → sets `x-request-id` and logs `rid=...` per request.
    - Errors include `requestId` in `error.details` for easier production debugging.
- **❌ Failed / Issues**
  - Contract smoke logs show a Nest warning about unsupported route path `"/v1/*"` auto-conversion (needs review before production hardening).
  - E2E uses mock POS sale flow (UI-only) because current POS screen uses `MOCK_PRODUCTS` and isn't wired to seeded backend inventory/treasury yet.
- **➡️ Next**
  - Action: Finalize log policy (dev vs prod) + close `/v1/*` warning source; then re-evaluate for Commercial readiness (soak 10–15min + real E2E pos-sale).
  - Owner: Agent-10
- **🧪 Commands**
  - `npm run test:coverage --workspace @pos-sahl/backend`
  - `npm run contract:smoke --workspace @pos-sahl/backend`
  - `npm run stress:pos-sale --workspace @pos-sahl/backend`
  - `npm run test`
  - `npm run test:e2e`

### 2026-04-24 19:56 (Local)
- **Agent**: Agent-10
- **Area**: Observability / Routing hardening / Stress
- **Status**: done

- **✅ Done**
  - Replaced backend `console.log/error` with Nest `Logger` in:
    - `apps/backend/src/common/interceptors/logging.interceptor.ts`
    - `apps/backend/src/common/filters/http-exception.filter.ts`
  - Fixed Nest warning `"/v1/*"` by using supported named wildcard middleware routes (`*path`) in `apps/backend/src/app.module.ts` (verified by `npm run contract:smoke` without warnings).
  - Updated stress runner to print latency percentiles available from autocannon (`p90/p97.5/p99`).
- **❌ Failed / Issues**
  - Autocannon لا يطلع p95 افتراضياً؛ حالياً بنوثق p90 + p97.5 + p99 كبديل، أو نبدّل الأداة لو p95 إلزامي.
- **➡️ Next**
  - Action: Soak 10–15 دقيقة + thresholds (Commercial readiness) + real E2E POS sale بعد ربط POS UI ببيانات فعلية بدل `MOCK_PRODUCTS`.
  - Owner: Agent-10
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run contract:smoke --workspace @pos-sahl/backend`
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run stress:pos-sale --workspace @pos-sahl/backend`

### 2026-04-24 20:27 (Local)
- **Agent**: Agent-10
- **Area**: Reliability / Soak
- **Status**: done

- **✅ Done**
  - Added soak runner: `apps/backend/tests/stress/pos-sale-soak.ts` + script `npm run soak:pos-sale --workspace @pos-sahl/backend`.
  - Ran 10-minute soak (POS sale) successfully:
    - duration: 600s, connections: 25
    - 136k requests
    - non-2xx: 0, errors: 0
    - latency: p90 175ms / p97.5 253ms / p99 314ms / max 1123ms
- **❌ Failed / Issues**
  - None (runner PASS). (ملاحظة: أول محاولة فشلت بسبب spam logs/track؛ تم ضبط runner لتقليل الإخراج ثم PASS).
- **➡️ Next**
  - Action: Real E2E POS sale بدون mock بعد ربط POS UI ببيانات فعلية بدل `MOCK_PRODUCTS`.
  - Owner: Agent-10
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres SOAK_DURATION_SEC=600 npm run soak:pos-sale --workspace @pos-sahl/backend`

### 2026-04-24 20:33 (Local)
- **Agent**: Agent-10
- **Area**: E2E / POS end-to-end
- **Status**: done

- **✅ Done**
  - Switched E2E POS flow from mocked sale to real end-to-end:
    - frontend runs with backend flags enabled (`BACKEND_FLAG_ONBOARDING/INVENTORY/FINANCE/REPORTS=1`)
    - test seeds backend sample data via `/v1/onboarding/sample-data`
    - test picks a real product from `/v1/inventory/products`
    - checkout triggers real `/v1/finance/pos-sale` and verifies invoice number
  - Updated POS UI to load products from backend when available (fallback to `MOCK_PRODUCTS`).
  - Fixed backend POS sale action to resolve warehouse/treasury defaults via `/v1/finance/defaults/:companyId`.
- **❌ Failed / Issues**
  - None (E2E PASS locally).
- **➡️ Next**
  - Action: Concurrency scenarios (Commercial): 50–200 concurrent + idempotency conflict case.
  - Owner: Agent-10
- **🧪 Commands**
  - `npm run test:e2e -- tests/e2e/full_user_journey.spec.ts`

### 2026-04-24 20:38 (Local)
- **Agent**: Agent-10
- **Area**: Reliability / Commercial concurrency & idempotency
- **Status**: done

- **✅ Done**
  - Concurrency run on `/v1/finance/pos-sale` at 100 concurrent connections (same product/treasury) — PASS:
    - errors: 0, non-2xx: 0
    - latency: p90 547ms / p97.5 633ms / p99 701ms / max 836ms
  - Added runtime idempotency conflict script (same `idempotency-key` + different payload → 409):
    - `apps/backend/tests/stress/idempotency-conflict.ts`
    - `npm run idempotency:conflict --workspace @pos-sahl/backend` (PASS)
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: If هدفنا “Commercial Ready” رسميًا، نكمّل بند log/PII/runbook policy النهائي + قياس memory/RSS في soak (اختياري).
  - Owner: Agent-10
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres STRESS_CONNECTIONS=100 STRESS_DURATION_SEC=10 npm run stress:pos-sale --workspace @pos-sahl/backend`
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run idempotency:conflict --workspace @pos-sahl/backend`

### 2026-04-24 16:36 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Backend Testing
- **Status**: done

- **✅ Done**
  - Added backend workspace test scripts in `apps/backend/package.json`: `test`, `test:watch`, `test:coverage`.
  - Added backend Vitest config `apps/backend/vitest.config.ts`.
  - Added Nest test helper `apps/backend/tests/helpers/nest-app.ts` (mirrors runtime global prefix/pipes/filters/interceptors).
  - Added backend smoke tests for health/readiness: `apps/backend/tests/health.spec.ts`.
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Add Postgres test strategy + migrations runner (BEGIN/ROLLBACK) to unlock service tests (Auth/Inventory/Finance).
  - Owner: Agent-09
- **🧪 Commands**
  - `npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: N/A (smoke tests only; service tests next).

### 2026-04-24 16:54 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Backend DB Testing + Auth
- **Status**: in_progress

- **✅ Done**
  - Implemented DB-backed test bootstrap that provisions a dedicated Postgres test database from Drizzle migration (`apps/backend/drizzle/0000_*.sql`) + supplemental tables for SaaS/idempotency.
  - Added DB helpers: `apps/backend/tests/helpers/test-db.ts`, `pg-client.ts`, `reset-db.ts` (truncate isolation).
  - Added DB-backed Auth tests: `apps/backend/tests/auth.service.spec.ts` (register/login/token expiry).
  - Adjusted finance invariant test to avoid relying on Drizzle internal SQL shape.
- **❌ Failed / Issues**
  - Docker compose in this environment required access to Docker daemon; existing postgres container `backend-postgres-1` was already running on `5433`.
- **➡️ Next**
  - Action: Add factories + begin Inventory/Onboarding DB-backed tests (then Finance POS sale/idempotency/sequence).
  - Owner: Agent-09
- **🧪 Commands**
  - `docker ps -a --filter name=backend-postgres-1`
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (to be captured after adding more service tests)

### 2026-04-24 16:56 (Local)
- **Agent**: Agent-09
- **Area**: Onboarding / Helpers
- **Status**: done

- **✅ Done**
  - Added backend test factories: `apps/backend/tests/helpers/factories.ts`.
  - Added db-backed Onboarding tests: `apps/backend/tests/onboarding.service.spec.ts` (createInitialCompany + setupSampleData).
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Add Inventory db-backed tests (list/search/create/updateStock/low-stock + tenant isolation).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 16:59 (Local)
- **Agent**: Agent-09
- **Area**: Inventory
- **Status**: done

- **✅ Done**
  - Fixed `InventoryService.getLowStockAlerts()` to reliably filter low-stock results (numeric-safe post-filter).
  - Added db-backed Inventory tests: `apps/backend/tests/inventory.service.spec.ts`:
    - tenant isolation for `listProducts`
    - search by name/barcode/sku
    - `createProduct` initializes stock when `warehouseId` provided
    - `updateStock` weighted average cost + sync product `avg_cost`
    - `getLowStockAlerts` returns only low-stock items
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Start Finance db-backed tests (POS sale: atomicity, insufficient stock, deferred vs cash, idempotency, invoice sequencing under concurrency).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:01 (Local)
- **Agent**: Agent-09
- **Area**: Finance
- **Status**: in_progress

- **✅ Done**
  - Added `createCustomer` factory to `apps/backend/tests/helpers/factories.ts`.
  - Added db-backed Finance tests: `apps/backend/tests/finance.service.spec.ts`:
    - cash POS sale: invoice + items + stock decrement + treasury tx + treasury balance increment + invoice number format `YYMM-NNN`
    - deferred POS sale: no treasury tx, customer balance increases, invoice becomes partial
    - insufficient stock throws `BadRequestException`
    - idempotency returns same invoice and avoids duplicate rows
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Extend Finance tests for atomicity rollback + invoice sequence under concurrency + idempotency hash mismatch conflict.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:05 (Local)
- **Agent**: Agent-09
- **Area**: Auth + Finance
- **Status**: done

- **✅ Done**
  - Extended Finance db-backed tests with:
    - atomic rollback verification
    - idempotency conflict (same key, different payload → `ConflictException`)
    - invoice sequence uniqueness under concurrency
  - Extended Auth db-backed tests with:
    - refresh token flow
    - session payload shape
    - production guardrail: fail when `JWT_SECRET` is unset
  - Added production guardrail in `apps/backend/src/modules/auth/auth.service.ts` (`JWT_SECRET` must be set when `NODE_ENV=production`).
- **❌ Failed / Issues**
  - None (backend suite green).
- **➡️ Next**
  - Action: Add Reports db-backed tests (daily summary + treasury + stock) with tenant isolation leak checks.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:06 (Local)
- **Agent**: Agent-09
- **Area**: Reports
- **Status**: done

- **✅ Done**
  - Fixed data isolation bug in `ReportsService.getTreasuryReport()` (now filters by `company_id`).
  - Added db-backed Reports tests: `apps/backend/tests/reports.service.spec.ts`:
    - daily summary returns zeros with no invoices
    - stock report aggregates qty/value across warehouses
    - treasury report is tenant-isolated (no cross-company leakage)
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Contract smoke tests need to run against compiled NestJS runtime (decorator metadata). We'll implement as a node script that builds/runs backend and asserts endpoints/envelope (instead of Vitest in-process).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:12 (Local)
- **Agent**: Agent-09
- **Area**: Integration
- **Status**: done

- **✅ Done**
  - Added integration flow tests: `apps/backend/tests/integration.flow.spec.ts`:
    - onboarding→product+stock→POS cash sale→reports reflect sales/profit/stock/treasury updates
    - multi-tenant treasury isolation (company A cannot see company B)
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Implement contract smoke checks as a runtime script (build+start backend then supertest/fetch asserts) to avoid decorator-metadata issues in in-process tests.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:15 (Local)
- **Agent**: Agent-09
- **Area**: Contract
- **Status**: done

- **✅ Done**
  - Added runtime contract smoke script (build+run backend then HTTP assertions): `apps/backend/tests/contract/contract-smoke.ts`.
  - Added workspace script: `npm run contract:smoke --workspace @pos-sahl/backend`.
  - Verified contract smoke for: auth register/session/refresh, onboarding company, finance pos-sale (with seeded defaults).
- **❌ Failed / Issues**
  - In-process supertest contract suite was removed due to decorator-metadata limitations under Vitest/esbuild; runtime script is the reliable path.
- **➡️ Next**
  - Action: Add stress/load runner (autocannon) and scripts to hit `/v1/finance/pos-sale` concurrently + verify idempotency/sequences.
  - Owner: Agent-09
- **🧪 Commands**
  - `npm run contract:smoke --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:20 (Local)
- **Agent**: Agent-09
- **Area**: Stress / CI / Coverage
- **Status**: done

- **✅ Done**
  - Added backend stress runner: `npm run stress:pos-sale --workspace @pos-sahl/backend` (autocannon, seeds data, runs load, asserts 0 errors/non-2xx).
  - Added root stress script: `npm run test:stress` (manual autocannon runner; requires env vars).
  - Added `docs/test_coverage_report.md` and captured backend coverage snapshot via `npm run test:coverage --workspace @pos-sahl/backend`.
  - Added CI workflow `.github/workflows/ci.yml` (lint + backend tests + backend coverage + contract smoke) with Postgres service.
- **❌ Failed / Issues**
  - Known: npm audit reports vulnerabilities (not addressed in this testing pass).
- **➡️ Next**
  - Action: Raise coverage toward acceptance thresholds by adding more Finance/Auth branch coverage + controller tests (optional).
  - Owner: Agent-09 / Orchestrator decision
- **🧪 Commands**
  - `npm run test:coverage --workspace @pos-sahl/backend`
  - `npm run contract:smoke --workspace @pos-sahl/backend`
  - `npm run stress:pos-sale --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Backend all-files lines: 58.99% (snapshot recorded in `docs/test_coverage_report.md`)

### 2026-04-24 16:24 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Testing
- **Status**: done

- **✅ Done**
  - Added Vitest runner + coverage + scripts in root `package.json` (`test`, `test:watch`, `test:coverage`, `test:e2e`).
  - Added `vitest.config.ts` with tsconfig-paths and coverage config.
  - Added `tsconfig.test.json` for Vitest/Playwright typing and test includes.
  - Added `playwright.config.ts` and aligned E2E baseURL to `http://localhost:4001`.
  - Migrated legacy Jest unit tests to Vitest: `tests/unit/frontend/*.spec.ts`.
  - Mocked Next.js-only APIs in unit tests (`next/cache` revalidatePath) + enabled backend flags per test to avoid Next request-scope issues.
- **❌ Failed / Issues**
  - None (unit suite is green).
- **➡️ Next**
  - Action: Add shared test helpers (`tests/helpers/**`) and Postgres-backed backend test strategy (migrations + BEGIN/ROLLBACK).
  - Owner: Agent-09
- **🧪 Commands**
  - `npm install`
  - `npm run test`
- **📊 Coverage**
  - Lines: 3.99% (expected low until backend/service tests land)
  - Commands: `npm run test:coverage`

- **Notes**
  - Backend smoke tests landed in `apps/backend/tests/*` and run via workspace scripts.

