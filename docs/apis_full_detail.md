# API Reference (تفصيلي) — CorePOS Backend

> **Base**: `/v1`
>
> **Success envelope**: `{ success: true, data: T }` (بعض endpoints legacy قد ترجع حقول مباشرة)
>
> **Error envelope**: `{ success: false, error: { code, message, details? } }`

## أخطاء شائعة (Codes)

- `AUTH_UNAUTHORIZED`
- `TENANT_MISSING`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `PLAN_LIMIT_EXCEEDED`
- `INSUFFICIENT_STOCK`
- `CREDIT_LIMIT_EXCEEDED`
- `PAYMENT_EXCEEDS_REMAINING`
- `INVARIANT_VIOLATION`

## Admin

### GET `/v1/admin/audit-logs`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/admin/audit-logs"
    }
  }
}
```

### GET `/v1/admin/companies`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/admin/companies"
    }
  }
}
```

## Auth

### POST `/v1/auth/login`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "email": "admin@pos-sahl.com",
  "password": "password123"
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized",
    "details": {
      "path": "/v1/auth/login"
    }
  }
}
```

### POST `/v1/auth/logout`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized",
    "details": {
      "path": "/v1/auth/logout"
    }
  }
}
```

### POST `/v1/auth/refresh`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized",
    "details": {
      "path": "/v1/auth/refresh"
    }
  }
}
```

### POST `/v1/auth/register`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "company": "Company Name"
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized",
    "details": {
      "path": "/v1/auth/register"
    }
  }
}
```

### POST `/v1/auth/reset`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/auth/reset"
    }
  }
}
```

### GET `/v1/auth/session`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@pos-sahl.com",
      "role": "admin",
      "companyId": "uuid-company"
    },
    "profile": {
      "company_id": "uuid-company",
      "branch_id": null,
      "role": "admin"
    },
    "company": {
      "id": "uuid-company",
      "name": "Company Name"
    },
    "subscription": {
      "status": "active",
      "plan": "pro",
      "ends_at": null
    }
  }
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized",
    "details": {
      "path": "/v1/auth/session"
    }
  }
}
```

## Contacts

### GET `/v1/contacts/customers`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/customers"
    }
  }
}
```

### POST `/v1/contacts/customers`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "name": "عميل",
  "phone": "010",
  "address": "",
  "email": "",
  "taxNumber": "",
  "creditLimit": "0"
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/customers"
    }
  }
}
```

### GET `/v1/contacts/customers/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/customers/{id}"
    }
  }
}
```

### PATCH `/v1/contacts/customers/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/customers/{id}"
    }
  }
}
```

### GET `/v1/contacts/suppliers`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/suppliers"
    }
  }
}
```

### POST `/v1/contacts/suppliers`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "name": "مورد",
  "phone": "010",
  "address": "",
  "email": "",
  "taxNumber": ""
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/suppliers"
    }
  }
}
```

### GET `/v1/contacts/suppliers/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/suppliers/{id}"
    }
  }
}
```

### PATCH `/v1/contacts/suppliers/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/contacts/suppliers/{id}"
    }
  }
}
```

## Finance

### GET `/v1/finance/defaults`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/defaults"
    }
  }
}
```

### GET `/v1/finance/defaults/{companyId}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/defaults/{companyId}"
    }
  }
}
```

### POST `/v1/finance/payment-receipt`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).
- **`Idempotency-Key`**: مطلوب لتفادي التكرار (موصى به بشدة).

**Request body (مثال)**

```json
{
  "treasuryId": "uuid-treasury",
  "amount": 5,
  "method": "cash",
  "notes": "",
  "invoiceId": "uuid-invoice",
  "customerId": "uuid-customer",
  "createdBy": "uuid-user"
}
```

**ملاحظات مهمة**

- لو `invoiceId` موجود:
  - يتم تحديث `invoices.paid/remaining` وتعيين `status=paid` عند اكتمال السداد
  - يتم تحديث `customers.balance` (خصم قيمة السداد)
  - لا يسمح بسداد أكبر من `invoice.remaining` (كود: `PAYMENT_EXCEEDS_REMAINING`)
- لو `invoiceId` غير موجود و`customerId` موجود:
  - يتم خصم `customers.balance` فقط (كسند قبض عام للعميل)

**Response (مثال نجاح)**

```json
{
  "success": true,
  "mode": "drizzle-transaction",
  "id": "uuid-tx"
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/payment-receipt"
    }
  }
}
```

### POST `/v1/finance/payments`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/payments"
    }
  }
}
```

### POST `/v1/finance/pos-sale`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).
- **`Idempotency-Key`**: مطلوب لتفادي التكرار (موصى به بشدة).

**Request body (مثال)**

```json
{
  "branchId": "uuid-branch",
  "warehouseId": "uuid-warehouse",
  "treasuryId": "uuid-treasury",
  "customerId": null,
  "discountAmount": 0,
  "taxAmount": 0,
  "totalAmount": 10,
  "paymentMethod": "cash",
  "lines": [
    {
      "productId": "uuid-product",
      "quantity": 1,
      "unitPrice": 10
    }
  ]
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "mode": "drizzle-transaction",
  "invoiceId": "uuid-invoice",
  "invoiceNumber": "2604-001"
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/pos-sale"
    }
  }
}
```

### POST `/v1/finance/purchase-invoice`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/purchase-invoice"
    }
  }
}
```

### GET `/v1/finance/purchase-invoices`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/purchase-invoices"
    }
  }
}
```

### GET `/v1/finance/purchase-invoices/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/purchase-invoices/{id}"
    }
  }
}
```

### POST `/v1/finance/purchase-returns`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/purchase-returns"
    }
  }
}
```

### POST `/v1/finance/purchases`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/purchases"
    }
  }
}
```

### POST `/v1/finance/sale-invoice`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).
- **`Idempotency-Key`**: مطلوب لتفادي التكرار (موصى به بشدة).

**Request body (مثال)**

```json
{
  "branchId": "uuid-branch",
  "warehouseId": "uuid-warehouse",
  "customerId": null,
  "cashierId": "uuid-user",
  "subtotal": 10,
  "discountAmount": 0,
  "taxAmount": 0,
  "total": 10,
  "paid": 10,
  "remaining": 0,
  "items": [
    {
      "productId": "uuid-product",
      "qty": 1,
      "unitPrice": 10,
      "totalLine": 10
    }
  ]
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "mode": "drizzle-transaction",
  "id": "uuid-invoice",
  "invoiceNumber": "2604-002"
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/sale-invoice"
    }
  }
}
```

### GET `/v1/finance/sale-invoices`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/sale-invoices"
    }
  }
}
```

### GET `/v1/finance/sale-invoices/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/sale-invoices/{id}"
    }
  }
}
```

### POST `/v1/finance/sale-returns`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/sale-returns"
    }
  }
}
```

### POST `/v1/finance/sales`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة",
    "details": {
      "path": "/v1/finance/sales"
    }
  }
}
```

### GET `/v1/finance/treasury`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/treasury"
    }
  }
}
```

### GET `/v1/finance/treasury/transactions`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/finance/treasury/transactions"
    }
  }
}
```

## Health

### GET `/v1/health`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/health"
    }
  }
}
```

### GET `/v1/readiness`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/readiness"
    }
  }
}
```

## Inventory

### GET `/v1/inventory/categories`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/categories"
    }
  }
}
```

### POST `/v1/inventory/categories`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "name": "تصنيف",
  "parentId": null
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/categories"
    }
  }
}
```

### PATCH `/v1/inventory/categories/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/categories/{id}"
    }
  }
}
```

### GET `/v1/inventory/low-stock`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/low-stock"
    }
  }
}
```

### GET `/v1/inventory/products`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/products"
    }
  }
}
```

### POST `/v1/inventory/products`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "name": "منتج",
  "barcode": "123",
  "sku": "SKU-1",
  "price1": "10",
  "costPrice": "8",
  "warehouseId": "uuid-warehouse",
  "initialQty": "5"
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/products"
    }
  }
}
```

### DELETE `/v1/inventory/products/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/products/{id}"
    }
  }
}
```

### GET `/v1/inventory/products/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/products/{id}"
    }
  }
}
```

### PATCH `/v1/inventory/products/{id}`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/products/{id}"
    }
  }
}
```

### GET `/v1/inventory/search`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/inventory/search"
    }
  }
}
```

## Onboarding

### POST `/v1/onboarding/company`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "name": "شركة",
  "phone": "01000000000",
  "address": "",
  "currency": "EGP",
  "vatRate": 14
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/onboarding/company"
    }
  }
}
```

### POST `/v1/onboarding/sample-data`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Request body (مثال)**

```json
{
  "companyId": "uuid-company (اختياري dev override)"
}
```

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/onboarding/sample-data"
    }
  }
}
```

## Reports

### GET `/v1/reports/daily`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/daily"
    }
  }
}
```

### GET `/v1/reports/profits`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/profits"
    }
  }
}
```

### GET `/v1/reports/sales`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/sales"
    }
  }
}
```

### GET `/v1/reports/stock`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/stock"
    }
  }
}
```

### GET `/v1/reports/top-products`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/top-products"
    }
  }
}
```

### GET `/v1/reports/treasury`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/treasury"
    }
  }
}
```

### GET `/v1/reports/trend`

**Headers**

- **`Cookie`**: session cookies (browser/SSR).
- **`x-company-id`**: *dev/tests فقط* (اختياري).

**Response (مثال نجاح)**

```json
{
  "success": true,
  "data": {}
}
```

**Response (مثال خطأ)**

```json
{
  "success": false,
  "error": {
    "code": "INVARIANT_VIOLATION",
    "message": "Invalid request",
    "details": {
      "path": "/v1/reports/trend"
    }
  }
}
```

