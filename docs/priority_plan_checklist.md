# خطة التنفيذ (Checklist) — Pos-Sahl

> **مبدأ العمل**: نشتغل بالأولوية (P0 ثم P1 ثم P2 ثم P3)، ونحدّث نفس الملف أول بأول بعلامات ✅.

---

## P0 — مالية/سلامة البيانات (لازم قبل Cutover)

### P0.1 `payment-receipt` (ربط السداد بالفاتورة + أرصدة العميل)
- [x] **Overpay guard**: لو `invoiceId` موجود → منع `amount > invoice.remaining` بكود `PAYMENT_EXCEEDS_REMAINING`
- [x] **Update invoice amounts**: تحديث `paid/remaining` داخل transaction
- [x] **Update invoice status**: تعيين `status=paid` عند اكتمال السداد
- [x] **Update invoice status (partial)**: تعيين `status=partial` عندما `remaining > 0` بعد السداد
- [x] **Update customer balance on payment**: خصم `customers.balance` عند السداد (لو الفاتورة/الطلب مرتبط بعميل)
- [x] **Link treasury tx**: ربط `treasury_transactions.reference_id/reference_type` بالفاتورة

### P0.2 `createSaleInvoice` (توازن رصيد العميل + Credit limit)
- [x] **Credit limit guard**: `CREDIT_LIMIT_EXCEEDED` عند `remaining > 0` و `customerId` موجود
- [x] **Update customer balance on invoice**: لو `remaining > 0` و `customerId` موجود → `customers.balance += remaining`
- [x] **Invoice invariants**: منع `paid > total` و `remaining > total` (أو تطبيعها)

### P0.3 POS Deferred Ledger correctness
- [x] POS deferred: `customers.balance += totalAmount` عند `paymentMethod=deferred`
- [x] POS invoice invariants (مراجعة): تأكيد `paid/remaining` محفوظين بشكل صحيح + status `partial`

---

## P1 — تجربة المستخدم وربط الأخطاء في UI

### P1.1 رسائل أخطاء واضحة (UI)
- [x] عرض رسالة `PAYMENT_EXCEEDS_REMAINING` بشكل مفهوم في Dialog السداد
- [x] عرض رسالة `CREDIT_LIMIT_EXCEEDED` بشكل مفهوم في POS/Sales
- [x] توحيد عرض الأخطاء القادمة من `backendFetch` (code/message/details)

### P1.2 Idempotency-Key من الفرونت
- [x] POS: إرسال `Idempotency-Key`
- [x] Sale invoice: إرسال `Idempotency-Key`
- [x] Payment receipt: إرسال `Idempotency-Key`

---

## P2 — OpenAPI/Docs كـ مصدر واحد
- [x] OpenAPI schemas تظهر (حل مشكلة `components.schemas` الفاضية)
- [x] توثيق `PaymentReceiptDto` (`invoiceId/customerId`) في docs
- [x] توثيق أكواد الأخطاء الجديدة في كل الوثائق (مراجعة شاملة)
- [x] تحديث `docs/api_routes_runtime_vs_openapi.md` (مشكلة `:id` vs `{id}`)

---

## P3 — اختبارات فعلية (Backend)
- [x] إعداد إطار اختبارات backend (Vitest config موجود مسبقاً)
- [x] Test: `PAYMENT_EXCEEDS_REMAINING`
- [x] Test: `CREDIT_LIMIT_EXCEEDED`
- [x] Smoke-ish: payment على invoice يحدّث status/balance (بـ mocks)

---

## سجل التنفيذ (Updates)
- (سيتم ملؤه أثناء التنفيذ)

