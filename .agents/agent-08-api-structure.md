# 🧩 Agent 08 — API Structure & Contract Architect
**المشروع:** CorePOS | **الحالة:** يبدأ فوراً (ويعمل بالتوازي مع Agent-07)

---

## 🛠️ Skills مهمة (بعد تثبيت Antigravity Skills لـ Cursor)

> تم التثبيت إلى: `~/.cursor/skills` عبر `npx antigravity-awesome-skills --cursor`

استخدم هذه الـ skills بشكل مباشر أثناء التنفيذ والمراجعة:

```text
@api-design-principles
@nestjs-expert
@zod-validation-expert
@security-auditor
@threat-modeling-expert
@testing-patterns
```

## 🎯 مهمتك الأساسية
أنت مهندس **هيكلة الـ APIs**. مسؤوليتك وضع **Structure كاملة ومتسقة** لكل الـ endpoints المطلوبة للنظام (Auth/Onboarding/Inventory/Contacts/Finance/Reports/Admin) بحيث:
- تكون قابلة للتنفيذ داخل `apps/backend` (NestJS).
- وتكون قابلة للاستهلاك من الفرونت عبر `src/lib/api/**` (Adapter) **بدون كسر الـ UI**.
- وتنتج **OpenAPI حقيقي** يعكس المسارات الحالية + المخطط النهائي المتفق عليه.

> **هدفك ليس “تخمين API”** — بل استخراج الـ API المطلوبة بناءً على الدومين الموجود في النظام (POS/Inventory/Finance/Reports) وربطها بتدفقات الصفحات الحالية.

---

## 🧠 مبادئ ملزمة (API Conventions)

### 1) Versioning + Base Path
- كل الـ routes تكون تحت: `/v1/*`
- مثال: `POST /v1/auth/login`

### 2) Tenant Context (Company Isolation)
- لا نعتمد على تمرير `companyId` في body لأي endpoint “تشغيلي”.
- مصدر الـ company:
  - Cookie/JWT claims (أساسي)
  - أو `x-company-id` (للتطوير والاختبارات فقط)
- أي endpoint يحتاج شركة ولا يجدها → **400** بخطأ موحد.

### 3) Response Envelope
كل الاستجابات تكون بهذا الشكل:

```ts
type ApiOk<T> = { success: true; data: T }
type ApiErr = {
  success: false
  error: { code: string; message: string; details?: unknown }
}
```

### 4) Errors (أكواد ثابتة)
- `AUTH_UNAUTHORIZED`
- `TENANT_MISSING`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `PLAN_LIMIT_EXCEEDED`
- `INSUFFICIENT_STOCK`
- `CREDIT_LIMIT_EXCEEDED`
- `INVARIANT_VIOLATION`

### 5) Pagination + Filtering (موحد)
- Standard list queries:
  - `q` search text
  - `limit` (default 25, max 100)
  - `cursor` (opaque)
  - `sort` و `order`
- Response للـ lists:

```ts
type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }
```

### 6) Idempotency (لعمليات المالية)
- لكل عمليات الإنشاء المالية (POS sale / invoices / payments) ندعم:
  - Header: `Idempotency-Key`
  - في حال التكرار → نفس النتيجة (بدون تكرار مستندات).

---

## 🧱 نطاق العمل المطلوب (Deliverables)

### D1) خريطة الـ API النهائية (Contract Map)
وثّق ملف واحد داخل `docs/` (أو داخل هذا الملف لو حابين) يحتوي:
- كل الـ endpoints
- request/response shapes (DTOs)
- الأكواد المحتملة للأخطاء
- أمثلة payloads
- ما الصفحات/الـ actions التي تستخدم كل endpoint

### D2) تحديث OpenAPI
- توليد OpenAPI فعلي من Swagger/NestJS يشمل كل المسارات.
- حفظ نسخة: `apps/backend/openapi.json` (محدثة وواقعية).

### D3) توحيد Naming و Cookie/Headers
- توثيق معيار واحد للأسماء:
  - `company_id` vs `companyId`
  - `x-company-id` دائمًا kebab-case
  - cookies: `access_token`, `refresh_token`, `company_id`

### D4) Adapter Contracts (Frontend)
لكل domain: ملف في `src/lib/api/<domain>.ts` يحتوي functions typed + Zod schemas للـ responses المهمة.

---

## 🗺️ API Structure المطلوبة (Minimum MVP)

### A) Auth `/v1/auth`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET  /v1/auth/session`
- `POST /v1/auth/reset` (MVP: stub مقبول لكن contract ثابت)

**Session shape (ثابت):**
- `user`
- `profile` (role, company_id, branch_id؟)
- `company`
- `subscription` (status, plan, ends_at)
- `limits` (اختياري كبداية)

### B) Onboarding `/v1/onboarding`
- `POST /v1/onboarding/company`
- `POST /v1/onboarding/sample-data`
- (اختياري) `POST /v1/onboarding/warehouse-branch` لو هنفصل الخطوة 2

### C) Inventory `/v1/inventory`
- `GET  /v1/inventory/products`
- `POST /v1/inventory/products`
- `GET  /v1/inventory/products/:id`
- `PATCH /v1/inventory/products/:id`
- `DELETE /v1/inventory/products/:id` (soft delete)
- `GET  /v1/inventory/categories`
- `POST /v1/inventory/categories`
- `PATCH /v1/inventory/categories/:id`
- `GET  /v1/inventory/low-stock`
- `GET  /v1/inventory/search` (للـ POS: barcode/name fast search)

### D) Contacts `/v1/contacts`
- `GET  /v1/contacts/customers`
- `POST /v1/contacts/customers`
- `GET  /v1/contacts/customers/:id`
- `PATCH /v1/contacts/customers/:id`
- `GET  /v1/contacts/suppliers`
- `POST /v1/contacts/suppliers`
- `GET  /v1/contacts/suppliers/:id`
- `PATCH /v1/contacts/suppliers/:id`

### E) Finance `/v1/finance`
**POS:**
- `POST /v1/finance/pos-sale`

**Sales:**
- `POST /v1/finance/sale-invoice`
- `GET  /v1/finance/sale-invoices`
- `GET  /v1/finance/sale-invoices/:id`
- `POST /v1/finance/sale-returns`

**Purchases:**
- `POST /v1/finance/purchase-invoice`
- `GET  /v1/finance/purchase-invoices`
- `GET  /v1/finance/purchase-invoices/:id`
- `POST /v1/finance/purchase-returns`

**Payments:**
- `POST /v1/finance/payment-receipt`
- `GET  /v1/finance/treasury`
- `GET  /v1/finance/treasury/transactions`

**Rules:**
- لا يوجد endpoint “stub” يُرجع رقم فاتورة عشوائي.
- كل endpoint مالي يحدد:
  - invariants
  - أخطاء stock/credit
  - idempotency behavior

### F) Reports `/v1/reports`
- `GET /v1/reports/daily`
- `GET /v1/reports/sales`
- `GET /v1/reports/profits`
- `GET /v1/reports/stock`
- `GET /v1/reports/treasury`
- إضافات Dashboard:
  - `GET /v1/reports/trend`
  - `GET /v1/reports/top-products`

### G) Admin `/v1/admin` (Super Admin)
- `GET /v1/admin/companies`
- `GET /v1/admin/audit-logs`
- (اختياري) `PATCH /v1/admin/companies/:id/subscription`

---

## ✅ Checklist تسليم (Gate)
- [ ] كل الـ endpoints السابقة موجودة في OpenAPI (مش مجرد health).
- [ ] كل list endpoint يدعم pagination/filtering.
- [ ] كل endpoint يحدد required roles (cashier/manager/admin/platform_admin).
- [ ] توحيد company context: cookie/header naming ثابت.
- [ ] توحيد envelope للأخطاء والنجاح عبر كل الـ controllers.
- [ ] Adapter functions في الفرونت تغطي مسارات: onboarding + POS sale + invoices + reports الأساسية.

