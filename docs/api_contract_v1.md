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

### Admin — Company Level `/v1/admin`

#### Users Management
- `GET  /v1/admin/users`                   — عرض مستخدمي الشركة (Permission: `admin.users.read`)
- `POST /v1/admin/users`                   — إنشاء مستخدم جديد (Permission: `admin.users.manage`)
- `PATCH /v1/admin/users/:id`              — تعديل بيانات المستخدم (Permission: `admin.users.manage`)
- `DELETE /v1/admin/users/:id`             — تعطيل مستخدم (Permission: `admin.users.manage`)
- `POST /v1/admin/users/:id/toggle-active` — تبديل حالة المستخدم (Permission: `admin.users.manage`)
- `POST /v1/admin/users/:id/reset-password`— إعادة تعيين كلمة المرور (Permission: `admin.users.manage`)

#### Roles Management
- `GET  /v1/admin/roles`                   — عرض أدوار الشركة (Permission: `admin.roles.manage`)
- `POST /v1/admin/roles`                   — إنشاء دور جديد (Permission: `admin.roles.manage`)
- `PATCH /v1/admin/roles/:id`              — تعديل صلاحيات دور (Permission: `admin.roles.manage`)
- `DELETE /v1/admin/roles/:id`             — حذف دور مخصص (Permission: `admin.roles.manage`)

#### Audit & Settings
- `GET /v1/admin/audit-logs`               — سجل نشاطات الشركة (Permission: `admin.audit.read`)
- `GET /v1/admin/companies`                — بيانات الشركة

**User Shapes**

```ts
// POST /v1/admin/users — Request
type CreateUserBody = {
  email: string
  password: string    // min 6 chars
  fullName: string
  role: 'admin' | 'manager' | 'cashier' | 'viewer'
  branchId?: string   // UUID of branch
  phone?: string
}

// GET /v1/admin/users — Response item
type AdminUserRow = {
  id: string
  email: string
  fullName: string
  role: string
  branchId: string | null
  branchName: string | null
  phone: string | null
  isActive: boolean
  createdAt: string | null
  lastLoginAt: string | null
}

// PATCH /v1/admin/users/:id — Request
type UpdateUserBody = {
  reason: string      // min 3 chars — audit trail
  fullName?: string
  role?: string
  branchId?: string | null
  phone?: string
  isActive?: boolean
}

// POST /v1/admin/users/:id/reset-password — Response
type ResetPasswordResponse = { tempPassword: string }
```

> **خطة التنفيذ التفصيلية:** [`docs/plans/USER_MANAGEMENT_MASTER_PLAN.md`](plans/USER_MANAGEMENT_MASTER_PLAN.md)

