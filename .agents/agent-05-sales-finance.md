# 💰 Agent 05 — Sales, Purchases & Finance Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Agent-03 (موازي مع Agent-04)

---

## 🎯 مهمتك الأساسية

أنت مهندس المعاملات المالية. مسؤوليتك بناء **وحدات المبيعات، المشتريات، العملاء، الموردين، والخزينة** كاملة.

---

## 🛠️ الـ Skills المطلوبة

```
@react-patterns
@zod-validation-expert
@tanstack-query-expert
@database
@react-component-performance
@fp-errors
```

---

## 📋 المهام التفصيلية

### MODULE A: المبيعات

#### A1. قائمة فواتير المبيعات `/dashboard/sales/invoices`

**DataTable يعرض:**
- رقم الفاتورة + التاريخ + العميل + المجموع + المدفوع + الباقي + الحالة
- فلاتر: تاريخ (من/إلى)، عميل، حالة (مدفوع/جزئي/آجل/ملغى)
- بحث حر
- تصدير Excel

#### A2. فاتورة مبيعات جديدة/تعديل

```typescript
// src/components/invoices/InvoiceForm.tsx
// الحقول:
// رأس الفاتورة: رقم (تلقائي)، تاريخ، العميل، القائمة السعرية، المخزن، المندوب
// الأصناف: بحث + إضافة + تعديل كمية/سعر/خصم
// ذيل: خصم الفاتورة، ضريبة، الإجمالي
// الدفع: كاش + بطاقة + آجل
// ملاحظات

// Server Action: createSaleInvoice()
// يجب أن يكون atomic:
// 1. إنشاء invoice
// 2. إنشاء invoice_items
// 3. خصم المخزون (بـ Trigger أو function)
// 4. إنشاء payments
// 5. تحديث رصيد العميل
// 6. تحديث الخزينة
// كل ده في transaction واحد
```

#### A3. عرض الفاتورة `/dashboard/sales/invoices/[id]`
- تفاصيل كاملة
- طباعة A4
- أزرار: تعديل (مسودة فقط) | إلغاء | طباعة | إضافة دفعة

#### A4. طباعة الفاتورة A4 `/dashboard/sales/invoices/[id]/print`
```typescript
// شكل احترافي يشمل:
// - شعار الشركة + بيانات الشركة
// - بيانات العميل + رقم الفاتورة + التاريخ
// - جدول الأصناف مع الخصومات
// - ملخص: مجموع / خصم / ضريبة / إجمالي
// - طريقة الدفع + المتبقي
// - ملاحظات + توقيع
// استخدام: window.print() + @media print CSS
```

#### A5. عرض الأسعار Quotations
- CRUD كامل مثل فاتورة المبيعات (نفس النموذج)
- حالة: مسودة → مرسل → قبول → مرفوض
- زر "تحويل لفاتورة" → ينشئ invoice من quotation مع `parent_id`

#### A6. مرتجعات المبيعات
```typescript
// يرتبط دائماً بفاتورة أصلية
// يختار العميل أو الفاتورة → تظهر الأصناف
// يختار الأصناف المُرتجعة + الكميات
// خيار: إرجاع للمخزون (checkbox لكل صنف)
// خيار الاسترداد: نقدي أو حساب العميل
```

---

### MODULE B: المشتريات

#### B1. فاتورة مشتريات `/dashboard/purchases/invoices/new`
```typescript
// مثل فاتورة المبيعات تماماً، لكن:
// - المورد بدل العميل
// - تحديث avg_cost للأصناف (عبر Trigger في DB)
// - إضافة للمخزون بدل خصم
```

#### B2. مرتجعات المشتريات
- يرتبط بفاتورة شراء أصلية
- خصم من المخزون
- استرداد من المورد

#### B3. أوامر الشراء (P1 — مرحلة ثانية)
- CRUD بسيط بدون تأثير على المخزون
- حالات: مسودة → مرسل → مستلم جزئي → مستلم كامل
- تحويل لفاتورة عند الاستلام

---

### MODULE C: العملاء والموردون

#### C1. قائمة العملاء `/dashboard/customers`
- جدول: الاسم + تليفون + الرصيد + آخر معاملة
- الرصيد: أخضر = دائن، أحمر = مدين للمحل
- بحث

#### C2. تفاصيل العميل `/dashboard/customers/[id]`
```
بيانات العميل + تعديل
────────────────────
الرصيد الحالي: 1,500 ج

جدولة كشف الحساب:
  رقم    التاريخ    التفاصيل       مدين    دائن    رصيد
  1024   17/4     فاتورة مبيعات  1,200    -     1,200
  سند1   17/4     دفعة نقدي        -     500    700
  ...
```

- زر "سند قبض جديد" (استلام دفعة من العميل)

#### C3. الموردون — نفس رحلة العملاء

---

### MODULE D: الخزينة والحسابات

#### D1. الخزينة `/dashboard/finance/treasury`
```
رصيد الخزينة الرئيسية: 15,200 ج
─────────────────────────────────
التاريخ    النوع         المبلغ    الرصيد بعد
17/4      مبيعات #1024  +1,200   15,200
17/4      مصروف (إيجار) -2,000   14,000
```

**فلاتر:** تاريخ، نوع الحركة، الخزينة (لو أكثر من واحدة)

#### D2. سند القبض (استلام من عميل)
```typescript
// حقول: العميل + المبلغ + طريقة الدفع + تاريخ + ملاحظات
// لو بطاقة: رقم المرجع
// لو شيك: رقم الشيك + تاريخ الاستحقاق + البنك
```

#### D3. سند الصرف (دفع لمورد أو مصروف)
```typescript
// حقول: المورد أو تصنيف المصروف + المبلغ + طريقة + تاريخ
```

#### D4. المصروفات `/dashboard/finance/expenses`
- CRUD بسيط مع تصنيف
- يؤثر على الخزينة

---

## 🔄 Server Actions الحاسمة

```typescript
// src/lib/actions/invoices.ts

// ❌ مش كده:
async function createInvoice(data) {
  await supabase.from('invoices').insert(data)
  await supabase.from('invoice_items').insert(items)
  // لو فشل هنا، المخزون ما اتحدثش
}

// ✅ الصح:
async function createSaleInvoice(data) {
  // استخدم رpc function في Supabase
  // تضمن atomic transaction
  const { data, error } = await supabase
    .rpc('create_sale_invoice', {
      p_invoice: invoiceData,
      p_items: itemsData,
      p_payments: paymentsData,
    })
}
```

**المطلوب إنشاؤها في DB (يتنسق مع Agent-01):**
- `create_sale_invoice(p_invoice, p_items, p_payments)` → UUID
- `create_purchase_invoice(p_invoice, p_items, p_payment)` → UUID
- `create_sale_return(p_original_invoice_id, p_items, p_refund)` → UUID
- `add_payment_receipt(p_payment)` → UUID

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف | الوصف |
|---|-------|-------|
| D1 | `src/app/(dashboard)/sales/**` | كل صفحات المبيعات |
| D2 | `src/app/(dashboard)/purchases/**` | كل صفحات المشتريات |
| D3 | `src/app/(dashboard)/customers/**` | صفحات العملاء |
| D4 | `src/app/(dashboard)/suppliers/**` | صفحات الموردين |
| D5 | `src/app/(dashboard)/finance/**` | الخزينة والسندات |
| D6 | `src/components/invoices/InvoiceForm.tsx` | نموذج الفاتورة المشترك |
| D7 | `src/components/invoices/InvoiceTable.tsx` | جدول الفواتير |
| D8 | `src/components/invoices/InvoicePrint.tsx` | طباعة A4 |
| D9 | `src/lib/actions/invoices.ts` | Server Actions الفواتير |
| D10 | `src/lib/actions/payments.ts` | Server Actions المدفوعات |
| D11 | `src/hooks/useInvoices.ts` | React Query hooks |
| D12 | `src/hooks/useCustomers.ts` | React Query hooks |

---

## ⚠️ قواعد صارمة

1. **كل العمليات المالية atomic** — استخدم Supabase RPC functions
2. **لا تُعدّل مخزون أو رصيد مباشرة** — يمر عبر transactions فقط
3. **الفاتورة المؤكدة لا تُحذف** — فقط "إلغاء" يسجل undo transaction
4. رقم الفاتورة **تسلسلي لا يتكرر** — استخدم sequence في DB
5. كل قيم مالية `NUMERIC(12,2)` — لا `float` أبداً

---

## 🔗 تعتمد على

- Agent-01: Schema + RPC functions في DB
- Agent-02: authStore, canCreateInvoice(), user context
- Agent-03: DataTable, PageHeader, shadcn components
- Agent-04: ProductSearchInput (تُعاد استخدامها في فواتير المبيعات)
