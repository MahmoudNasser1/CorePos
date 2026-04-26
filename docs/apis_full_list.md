# 📌 قائمة الـ APIs الكاملة (Backend)

> **المصدر**: `apps/backend/openapi.json` (Swagger generated)  
> **Base**: `/v1`  
> **Envelope**:
> - نجاح: `{ success: true, data: ... }` (أو بعض endpoints القديمة ترجع fields مباشرة)
> - خطأ: `{ success: false, error: { code, message, details? } }`
>
> **Tenant context**: من cookies/JWT أساسًا، و`x-company-id` للتطوير/الاختبارات فقط.  
> **Idempotency** (العمليات المالية): Header `Idempotency-Key`.
>
> **Error codes (Finance)**:
> - `CREDIT_LIMIT_EXCEEDED`: عند تجاوز حد ائتمان العميل في البيع الآجل
> - `PAYMENT_EXCEEDS_REMAINING`: عند محاولة سداد أكبر من المتبقي على الفاتورة

---

## Admin

- **GET** `/v1/admin/audit-logs`
- **GET** `/v1/admin/companies`

## Auth

- **POST** `/v1/auth/login`
- **POST** `/v1/auth/logout`
- **POST** `/v1/auth/refresh`
- **POST** `/v1/auth/register`
- **POST** `/v1/auth/reset`
- **GET** `/v1/auth/session`

## Contacts

- **GET** `/v1/contacts/customers`
- **POST** `/v1/contacts/customers`
- **GET** `/v1/contacts/customers/{id}`
- **PATCH** `/v1/contacts/customers/{id}`
- **GET** `/v1/contacts/suppliers`
- **POST** `/v1/contacts/suppliers`
- **GET** `/v1/contacts/suppliers/{id}`
- **PATCH** `/v1/contacts/suppliers/{id}`

## Finance

- **GET** `/v1/finance/defaults`
- **GET** `/v1/finance/defaults/{companyId}` *(legacy; يتم تجاهل param والاعتماد على tenant context)*
- **POST** `/v1/finance/payment-receipt` *(يدعم `Idempotency-Key`)*  
  - يدعم حقول اختيارية: `invoiceId?` و `customerId?`  
  - **Invariant**: لو `invoiceId` موجود → لا يسمح بسداد أكبر من `remaining` (كود: `PAYMENT_EXCEEDS_REMAINING`)
- **POST** `/v1/finance/payments` *(legacy/placeholder)*
- **POST** `/v1/finance/pos-sale` *(يدعم `Idempotency-Key`)*
- **POST** `/v1/finance/purchase-invoice` *(stub)*
- **GET** `/v1/finance/purchase-invoices` *(stub)*
- **GET** `/v1/finance/purchase-invoices/{id}` *(stub)*
- **POST** `/v1/finance/purchase-returns` *(legacy/placeholder)*
- **POST** `/v1/finance/purchases` *(legacy/placeholder)*
- **POST** `/v1/finance/sale-invoice` *(يدعم `Idempotency-Key`)*
- **GET** `/v1/finance/sale-invoices`
- **GET** `/v1/finance/sale-invoices/{id}`
- **POST** `/v1/finance/sale-returns` *(legacy/placeholder)*
- **POST** `/v1/finance/sales` *(غير مدعوم/يرجع Not Implemented)*
- **GET** `/v1/finance/treasury`
- **GET** `/v1/finance/treasury/transactions`

## Health

- **GET** `/v1/health`
- **GET** `/v1/readiness`

## Inventory

- **GET** `/v1/inventory/categories`
- **POST** `/v1/inventory/categories`
- **PATCH** `/v1/inventory/categories/{id}`
- **GET** `/v1/inventory/low-stock`
- **GET** `/v1/inventory/products` *(pagination: `q/limit/cursor/sort/order`)*
- **POST** `/v1/inventory/products`
- **GET** `/v1/inventory/products/{id}`
- **PATCH** `/v1/inventory/products/{id}`
- **DELETE** `/v1/inventory/products/{id}` *(soft delete)*
- **GET** `/v1/inventory/search`

## Onboarding

- **POST** `/v1/onboarding/company`
- **POST** `/v1/onboarding/sample-data`

## Reports

- **GET** `/v1/reports/daily`
- **GET** `/v1/reports/profits`
- **GET** `/v1/reports/sales`
- **GET** `/v1/reports/stock`
- **GET** `/v1/reports/top-products`
- **GET** `/v1/reports/treasury`
- **GET** `/v1/reports/trend`

