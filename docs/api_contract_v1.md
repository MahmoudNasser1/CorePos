# CorePOS API Contract (v1)

هذا المستند هو **العقد الرسمي** بين `apps/backend` (NestJS) و `src/lib/api/**` (Frontend adapters).

## Conventions (ملزمة)

### Base path
- كل الـ endpoints تحت: `/v1/*`

### Tenant Context (Company isolation)
- ممنوع تمرير `companyId` في body لأي endpoint تشغيلي.
- مصدر الشركة:
  - **JWT claims** (داخل cookie `access_token`) أو
  - **Cookie**: `company_id` (لأغراض UX/dev)
  - **Header**: `x-company-id` (للتطوير/الاختبارات فقط)
- عند غياب tenant context:

```json
{ "success": false, "error": { "code": "TENANT_MISSING", "message": "Missing company context" } }
```

### Response envelope

```ts
type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error: { code: string; message: string; details?: unknown } }
```

### Errors (codes)
- `AUTH_UNAUTHORIZED`
- `TENANT_MISSING`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `PLAN_LIMIT_EXCEEDED`
- `INSUFFICIENT_STOCK`
- `CREDIT_LIMIT_EXCEEDED`
- `INVARIANT_VIOLATION`

### Pagination (lists)
- Query params القياسية:
  - `q`: search text
  - `limit`: default 25, max 100
  - `cursor`: opaque (MVP: قد يتم تجاهله مؤقتًا)
  - `sort`, `order`
- Shape:

```ts
type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }
```

### Idempotency (finance creates)
- Header: `Idempotency-Key` (MVP: مقبول ومُمرر، مع دعم فعلي لاحقًا)

---

## Endpoints (MVP)

### Auth `/v1/auth`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET  /v1/auth/session`
- `POST /v1/auth/reset` (stub)

**Session shape**

```json
{
  "success": true,
  "data": {
    "user": {},
    "profile": { "company_id": "uuid", "role": "admin|manager|cashier" },
    "company": { "id": "uuid", "name": "..." },
    "subscription": { "status": "active|trial|canceled", "plan": "free|pro", "ends_at": null }
  }
}
```

### Onboarding `/v1/onboarding`
- `POST /v1/onboarding/company`
- `POST /v1/onboarding/sample-data` (يسمح بـ `companyId` كـ dev override فقط)

### Inventory `/v1/inventory`
- `GET  /v1/inventory/products` (list + pagination)
- `POST /v1/inventory/products`
- `GET  /v1/inventory/products/:id`
- `PATCH /v1/inventory/products/:id`
- `DELETE /v1/inventory/products/:id` (soft delete)
- `GET  /v1/inventory/categories`
- `POST /v1/inventory/categories`
- `PATCH /v1/inventory/categories/:id`
- `GET  /v1/inventory/low-stock`
- `GET  /v1/inventory/search?q=` (fast POS search)

### Contacts `/v1/contacts`
- `GET  /v1/contacts/customers` (list + pagination)
- `POST /v1/contacts/customers`
- `GET  /v1/contacts/customers/:id`
- `PATCH /v1/contacts/customers/:id`
- `GET  /v1/contacts/suppliers` (list + pagination)
- `POST /v1/contacts/suppliers`
- `GET  /v1/contacts/suppliers/:id`
- `PATCH /v1/contacts/suppliers/:id`

### Finance `/v1/finance`
- `GET  /v1/finance/defaults` (بديل جديد)
- `GET  /v1/finance/defaults/:companyId` (legacy: يتم تجاهل param)
- `POST /v1/finance/pos-sale` (يدعم `Idempotency-Key`)
- `POST /v1/finance/sale-invoice` (يدعم `Idempotency-Key`)
- `GET  /v1/finance/sale-invoices` (list + pagination)
- `GET  /v1/finance/sale-invoices/:id`
- `POST /v1/finance/payment-receipt` (يدعم `Idempotency-Key`)
- `GET  /v1/finance/treasury`
- `GET  /v1/finance/treasury/transactions`
- `POST /v1/finance/purchase-invoice` (stub)
- `GET  /v1/finance/purchase-invoices` (stub)
- `GET  /v1/finance/purchase-invoices/:id` (stub)

### Reports `/v1/reports`
- `GET /v1/reports/daily`
- `GET /v1/reports/sales`
- `GET /v1/reports/profits`
- `GET /v1/reports/stock`
- `GET /v1/reports/treasury`
- `GET /v1/reports/trend`
- `GET /v1/reports/top-products`

### Admin `/v1/admin`
- `GET /v1/admin/companies`
- `GET /v1/admin/audit-logs`

