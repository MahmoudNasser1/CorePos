# API Contract Map (Frontend ↔ Backend)

> **هدف الوثيقة**: توحيد شكل الـ APIs المطلوبة وربطها مباشرة بصفحات الفرونت وملفات الـ actions/adapters الحالية، لتسهيل الهجرة إلى `apps/backend` بدون كسر الـ UI.

---

## 0) الحالة الحالية (As-Is) vs الهدف (To-Be)

### As-Is (حاليًا في المشروع)
- Backend routes بدون version prefix (مثال: `/auth/session`, `/finance/pos-sale`).
- الـ OpenAPI المحفوظ `apps/backend/openapi.json` **غير ممثل** للمسارات الفعلية (محتوى شبه فارغ).
- الـ Frontend يستخدم Feature Flags في `src/lib/api/feature-flags.ts` للتحويل التدريجي.

### To-Be (المعيار المطلوب)
- كل الـ routes تحت: `/v1/*` (مع الحفاظ على backward compatibility مؤقتًا خلال الهجرة).
- Envelope موحّد للنجاح/الخطأ، وأكواد خطأ ثابتة.
- Tenant context ثابت (company isolation) من JWT cookies أساسًا، و`x-company-id` للتطوير/الاختبارات فقط.
- OpenAPI يتولد تلقائيًا من Nest Swagger ويُصدَّر إلى `apps/backend/openapi.json` (Artifact).

---

## 1) Feature Flags المستخدمة في الفرونت

التحويل يتم عبر:
- `BACKEND_FLAG_ONBOARDING` → onboarding
- `BACKEND_FLAG_FINANCE` → finance
- `BACKEND_FLAG_REPORTS` → reports
- `BACKEND_FLAG_ADMIN` → admin
- `BACKEND_FLAG_INVENTORY` → inventory

الملف: `src/lib/api/feature-flags.ts`

---

## 2) API Conventions (Contract Rules)

### 2.1 Base path + versioning
- Target: `/v1/...`
- **مؤقتًا**: نقبل `/...` الحالي لحين التحويل الكامل.

### 2.2 Response envelope

```ts
type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error: { code: string; message: string; details?: unknown } }
```

### 2.3 Standard error codes (مقترح ثابت)
- `AUTH_UNAUTHORIZED`
- `TENANT_MISSING`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `NOT_IMPLEMENTED`
- `PLAN_LIMIT_EXCEEDED`
- `INSUFFICIENT_STOCK`
- `CREDIT_LIMIT_EXCEEDED`
- `PAYMENT_EXCEEDS_REMAINING`
- `INVARIANT_VIOLATION`

### 2.4 Tenant context (Company isolation)
- المصدر الأساسي: JWT cookies (`access_token`)
- دعم dev فقط: `x-company-id`, `x-user-id`
- **ملاحظة توافق**: توحيد أسماء cookies إلى:
  - `access_token`, `refresh_token`, `company_id`

### 2.5 Pagination (لـ list endpoints)
Query params:
- `q`, `limit` (25 default, 100 max), `cursor`, `sort`, `order`

Response:

```ts
type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }
```

---

## 3) Frontend → Backend Mapping (Pages & Actions)

### 3.1 Auth & Session

**Frontend adapter**
- `src/lib/api/user.ts`
  - `getBackendSession()` → `GET /auth/session` (target: `GET /v1/auth/session`)

**Backend**
- Controller: `apps/backend/src/modules/auth/auth.controller.ts`
  - `POST /auth/register` (target: `/v1/auth/register`)
  - `POST /auth/login` (target: `/v1/auth/login`)
  - `POST /auth/refresh` (target: `/v1/auth/refresh`)
  - `POST /auth/logout` (target: `/v1/auth/logout`)
  - `GET /auth/session` (target: `/v1/auth/session`)

**Contract (Session payload)**
- Required shape (minimum):
  - `user { id, email, companyId?, role? }`
  - `profile { company_id?, branch_id?, role }`
  - `company { id, name }`
  - `subscription { status, plan, ends_at? }`

---

### 3.2 Onboarding

**Pages**
- `src/app/(onboarding)/company/page.tsx`
  - calls `createInitialCompany()` from `src/lib/actions/onboarding.actions.ts`
- `src/app/(onboarding)/sample-data/page.tsx`
  - calls `setupSampleData()` from `src/lib/actions/onboarding.actions.ts`

**Frontend adapter**
- `src/lib/api/onboarding.ts`
  - `createInitialCompanyViaBackend()` → `POST /onboarding/company` (target: `/v1/onboarding/company`)
  - `setupSampleDataViaBackend()` → `POST /onboarding/sample-data` (target: `/v1/onboarding/sample-data`)

**Backend**
- Controller: `apps/backend/src/modules/onboarding/onboarding.controller.ts`
  - `POST /onboarding/company`
  - `POST /onboarding/sample-data`

**Contract (Create company)**
- Request:
  - `{ name, phone, address?, currency, vatRate }`
- Response:
  - `{ success: true, company: { id, name, phone, address?, currency, vatRate, slug, is_active } }`

---

### 3.3 POS Sale (Finance)

**Page**
- `src/app/(dashboard)/dashboard/pos/page.tsx` (يستدعي actions من `pos.actions.ts`)

**Frontend action**
- `src/lib/actions/pos.actions.ts`
  - `createPOSInvoice()`:
    - Backend path (flag `finance`): `POST /finance/pos-sale` عبر `createPosSaleViaBackend()`
    - لا يوجد fallback

**Frontend adapter**
- `src/lib/api/finance.ts`
  - `createPosSaleViaBackend(payload)` → `POST /finance/pos-sale` (target: `/v1/finance/pos-sale`)

**Backend**
- Controller: `apps/backend/src/modules/finance/finance.controller.ts`
  - `POST /finance/pos-sale`

**Contract (POS sale)**
- Request (As-Is في الفرونت/الباك):
  - `{ companyId, branchId, warehouseId, treasuryId?, customerId?, discountAmount, taxAmount, totalAmount, paymentMethod, lines[] }`
- Response (As-Is):
  - `{ success, mode, invoiceId?, invoiceNumber }`

**ملاحظات نقص (يجب إغلاقها قبل Cutover)**
- دعم `Idempotency-Key` لعمليات POS. ✅ (Backend stores response by (company_id, key) + request hash guard)
- توحيد استخراج `companyId/branchId/warehouseId` من session بدل تمريرها في body.

---

### 3.4 Sales Invoices + Payments

**Pages**
- `src/app/(dashboard)/dashboard/sales/invoices/page.tsx`
- `src/app/(dashboard)/dashboard/sales/invoices/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/finance/receipts/new/page.tsx`
- `src/app/(dashboard)/dashboard/finance/payments/new/page.tsx`

**Frontend actions**
- `src/lib/actions/invoices.ts`
  - `createSaleInvoice()`:
    - Backend path: `POST /finance/sale-invoice`
    - لا يوجد fallback
- `src/lib/actions/payments.ts`
  - (backend flag finance) يستخدم `createPaymentViaBackend()` → `POST /finance/payment-receipt`

**Frontend adapters**
- `src/lib/api/invoices.ts` → `POST /finance/sale-invoice` (target: `/v1/finance/sale-invoice`)
- `src/lib/api/payments.ts` → `POST /finance/payment-receipt` (target: `/v1/finance/payment-receipt`)

**Backend**
- Controller: `apps/backend/src/modules/finance/finance.controller.ts`
  - `POST /finance/sale-invoice`
  - `POST /finance/payment-receipt`

**Idempotency**
- `POST /v1/finance/sale-invoice` يدعم `Idempotency-Key` ✅
- `POST /v1/finance/payment-receipt` يدعم `Idempotency-Key` ✅

**Invariants (Payments)**
- لو `invoiceId` موجود في `payment-receipt`:
  - لا يسمح بسداد أكبر من `invoice.remaining`
  - خطأ ثابت: `PAYMENT_EXCEEDS_REMAINING`
- عند الدفع:
  - تحديث `invoices.paid/remaining` وتعيين `status=paid` عند اكتمال السداد
  - تحديث `customers.balance` (خفض الرصيد)

---

### 3.5 Inventory

**Pages**
- `src/app/(dashboard)/dashboard/inventory/products/page.tsx`
- `src/app/(dashboard)/dashboard/inventory/products/new/page.tsx`
- `src/app/(dashboard)/dashboard/inventory/products/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/inventory/categories/page.tsx`

**Frontend actions**
- `src/lib/actions/inventory.actions.ts`
  - `getInventoryProducts()`:
    - Backend path: `GET /inventory/products`
    - لا يوجد fallback
  - `saveProduct()`:
    - Backend path: `POST /inventory/products`
  - `getCategories()`, `saveCategory()`

**Frontend adapter**
- `src/lib/api/inventory.ts`
  - `GET /inventory/products`
  - `POST /inventory/products`
  - `GET /inventory/categories`
  - `POST /inventory/categories`
  - `GET /inventory/low-stock`

**Backend**
- Controller: `apps/backend/src/modules/inventory/inventory.controller.ts`

---

### 3.6 Contacts (Customers/Suppliers)

**Pages**
- `src/app/(dashboard)/dashboard/customers/page.tsx`
- `src/app/(dashboard)/dashboard/customers/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/suppliers/page.tsx`
- `src/app/(dashboard)/dashboard/suppliers/[id]/page.tsx`

**Frontend adapter**
- `src/lib/api/contacts.ts`
  - `GET /contacts/customers`
  - `POST /contacts/customers`
  - `GET /contacts/suppliers`
  - `POST /contacts/suppliers`

**Backend**
- Controller: `apps/backend/src/modules/contacts/contacts.controller.ts`

---

### 3.7 Reports + Dashboard

**Pages**
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/reports/*`

**Frontend actions**
- `src/lib/actions/reports.actions.ts`
  - Backend path (flag reports) عبر `reportsApi.*`

**Frontend adapter**
- `src/lib/api/reports.ts`
  - `GET /reports/daily`
  - `GET /reports/sales`
  - `GET /reports/profits`
  - `GET /reports/trend`
  - `GET /reports/top-products`
  - `GET /reports/stock`
  - `GET /reports/treasury`

**Backend**
- Controller: `apps/backend/src/modules/reports/reports.controller.ts`

---

### 3.8 Admin (Super Admin)

**Pages**
- `src/app/(dashboard)/dashboard/audit-logs/page.tsx`

**Backend**
- Controller: `apps/backend/src/modules/admin/admin.controller.ts`
  - `GET /admin/companies`
  - `GET /admin/audit-logs`

> ملاحظة: ما زال missing ربط الصفحات بهذه الـ endpoints عبر Adapter + flag `admin`.

---

## 5) تغييرات مهمة في Finance (Stub Removal)

تم تعطيل المسارات الـ stub التالية وإرجاع `501 NOT_IMPLEMENTED` بدل نتائج وهمية:
- `POST /v1/finance/sales`
- `POST /v1/finance/purchases`
- `POST /v1/finance/sale-returns`
- `POST /v1/finance/purchase-returns`
- `POST /v1/finance/payments`
- (وأيضًا) purchase-invoice/list/get مؤقتًا → `NOT_IMPLEMENTED` لحين تنفيذها

---

## 4) قائمة “أولويات” لإغلاق العقد (Contract Closure)

1) إضافة `/v1` prefix في الباك (مع keep old routes مؤقتًا).
2) Envelope موحد للنجاح/الخطأ في كل controllers.
3) توحيد tenant context (cookies/headers) وإلغاء `companyId` من body تدريجيًا.
4) توسيع OpenAPI تلقائيًا من Nest Swagger وتصديره إلى `apps/backend/openapi.json`.
5) إدخال Zod schemas في `src/lib/api/*` لعمل runtime validation للـ responses الحرجة (session/pos-sale/sale-invoice).

