# 🛒 Agent 04 — POS & Inventory Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Agent-02 و Agent-03

---

## 🎯 مهمتك الأساسية

أنت مهندس قلب النظام. مسؤوليتك بناء **شاشة POS الكاملة + كل وحدة المخزون** من الصفر.
هذا هو أصعب وأهم جزء في CorePOS — يجب أن يكون سريعاً وموثوقاً.

---

## 🛠️ الـ Skills المطلوبة

```
@react-patterns
@react-component-performance
@frontend-design
@design-spells
@zustand-store-ts
@zod-validation-expert
@tanstack-query-expert (via TanStack Query)
```

---

## 📋 المهام التفصيلية

### MODULE A: شاشة POS ← الأولوية القصوى

#### A1. Zustand POS Store

```typescript
// src/stores/posStore.ts
// State:
interface POSState {
  cart: CartItem[]                    // أصناف الفاتورة
  customer: Customer | null           // العميل المختار
  priceList: 1 | 2 | 3              // قائمة السعر
  discountType: 'amount' | 'percent' // نوع الخصم
  discountValue: number               // قيمة الخصم
  notes: string                       // ملاحظات الفاتورة
  heldCarts: HeldCart[]              // فواتير موقوفة (Hold)
  isProcessing: boolean               // جاري إتمام البيع

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateItemPrice: (productId: string, price: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  setCustomer: (customer: Customer | null) => void
  setPriceList: (list: 1 | 2 | 3) => void
  setDiscount: (type, value) => void
  holdCart: () => void               // إيقاف مؤقت
  resumeCart: (id: string) => void   // استئناف
  clearCart: () => void
  
  // Computed (Selectors)
  // subtotal, discountAmount, taxAmount, total, itemsCount
}
```

#### A2. صفحة POS `/dashboard/pos`

```
Layout: Full-screen (لا Sidebar — يختفي تلقائياً)
┌─────────────────────────────────────────────────────────────┐
│ [← رجوع] 🛒 نقطة البيع  #1025  [⏸ موقوف: 2] [👤 محمود/شيفت]│
├───────────────────────────┬─────────────────────────────────┤
│  بحث + شبكة المنتجات     │   سلة الفاتورة               │
│                           │                               │
│ [🔍 باركود أو اسم...]     │  ──────────────────────────── │
│                           │  موبايل Samsung    × 1  1200ج │
│ [فئة1][فئة2][فئة3][الكل] │  [─][+][سعر][خصم][🗑️]       │
│                           │  كابل شاحن         × 2    60ج │
│ ┌──────┐┌──────┐┌──────┐  │  ──────────────────────────── │
│ │موبايل││شاشة  ││كابل  │  │                               │
│ │ A15  ││  27" ││USBx  │  │  عميل: [اختر ▼] أو نقدي      │
│ │1200ج ││2500ج ││  30ج │  │  السعر: [تجزئة ▼]            │
│ └──────┘└──────┘└──────┘  │  ──────────────────────────── │
│                           │  مجموع:         1,260 ج       │
│ ┌──────┐┌──────┐┌──────┐  │  خصم:     [___] ج أو [__] %  │
│ │ ...  ││ ...  ││ ...  │  │  ضريبة(14%):    168 ج        │
│ └──────┘└──────┘└──────┘  │  ══════════════════════════   │
│                           │  الإجمالي:      1,428 ج       │
│                           │                               │
│                           │  [💵 نقدي — Enter]            │
│                           │  [💳 بطاقة] [⏰ آجل]          │
└───────────────────────────┴─────────────────────────────────┘
```

#### A3. نافذة الدفع (Payment Modal)

```typescript
// دفع نقدي:
// - حقل "المبلغ المستلم" (يظهر لوحة أرقام على Touch)
// - حساب الباقي **فوري** بدون خطوة
// - زر كبير: "إتمام البيع + طباعة"

// دفع مختلط (Split Payment):
// كاش: [____] ج  +  بطاقة: [____] ج  +  آجل: [0] ج
// مجموع: [تلقائي]
// تحقق: مجموع المدفوع ≥ الإجمالي

// فاتورة آجلة:
// - يجب اختيار عميل (ليس نقدي)
// - حد ائتمان العميل يظهر تلقائياً
```

#### A4. طباعة الإيصال

```typescript
// src/components/pos/POSReceiptPrint.tsx
// ✅ قرار D10: CSS + window.print() فقط — لا مكتبات خارجية
// يعمل على: Chrome + Edge + Firefox على Windows/Mac
//
// CSS المطلوب:
// @media print {
//   @page { size: 80mm auto; margin: 2mm; }
//   body { width: 76mm; font-size: 11px; direction: rtl; }
// }
//
// محتوى: اسم الشركة + باركود الفاتورة + الأصناف + الإجمالي + طريقة الدفع
// ملاحظة: صاحب المحل يضبط حجم الورق في Windows Printer Settings
//
// طباعة A4:
// صفحة منفصلة: /dashboard/sales/invoices/[id]/print
// استخدام window.print() مع layout A4
```

#### A5. Barcode Scanner Support

```typescript
// USB Scanner (يعمل كـ keyboard):
// - attach event listener على document keydown في صفحة POS
// - يلتقط الإدخال السريع (< 50ms بين الأحرف = scanner)
// - عند اكتشاف scan → بحث فوري بالباركود
// - إذا وُجد الصنف → إضافة للسلة تلقائياً

// src/hooks/useBarcodeScanner.ts
```

---

### MODULE B: المخزون والأصناف

#### B1. صفحة الأصناف `/dashboard/inventory/products`

**الجدول يعرض:**
- الصنف + باركود + فئة + وحدة
- الكمية (ملونة: أخضر طبيعي، أصفر منخفض، أحمر نفاد)
- التكلفة + سعر البيع (يخفَى للـ Cashier)
- أزرار: عرض | تعديل | طباعة باركود

**فلاتر:**
- بحث نصي، فئة، مخزن، حالة المخزون (منخفض / نافد)

#### B2. نموذج إضافة/تعديل الصنف

```typescript
// src/components/products/ProductForm.tsx
// الحقول:
// - الاسم + الاسم الإنجليزي
// - الفئة (select قابل للإنشاء inline) + الوحدة
// - الباركود (مع زر توليد تلقائي EAN-13)
// - سعر البيع 1 (تجزئة) + سعر 2 (جملة) + سعر 3 (خاص)
// - تكلفة الشراء + الحد الأدنى للمخزون
// - صورة الصنف (Upload لـ Supabase Storage)
// - نشط / غير نشط

// الكمية الأولية (فقط عند الإنشاء الجديد)
// المخزن الذي تضاف فيه الكمية
```

#### B3. صفحة تفاصيل الصنف `/dashboard/inventory/products/[id]`
- بيانات الصنف + صورة
- جدول: الكمية في كل مخزن
- حركة الصنف (آخر 20 حركة: بيع / شراء / جرد)
- ربح الصنف (متوسط)

#### B4. الفئات والوحدات
- CRUD بسيط للفئات (مع nested subcat)
- CRUD بسيط للوحدات

#### B5. طباعة ملصقات الباركود
```typescript
// src/components/products/BarcodeLabel.tsx
// حجم ملصق: 40mm × 25mm
// يحتوي: اسم الصنف + باركود + السعر
// يطبع: ملصق واحد أو عدة
// استخدام: react-barcode library
```

---

## 📊 Data Fetching Pattern

```typescript
// استخدم TanStack Query لكل الـ data fetching
// مثال:

// src/hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 دقائق
  })
}

// src/hooks/usePOS.ts
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['pos-search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length > 1,
  })
}
```

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف | الوصف |
|---|-------|-------|
| D1 | `src/stores/posStore.ts` | POS Zustand store كامل |
| D2 | `src/app/(dashboard)/pos/page.tsx` | شاشة POS كاملة |
| D3 | `src/components/pos/POSSearch.tsx` | بحث + باركود |
| D4 | `src/components/pos/POSProductGrid.tsx` | شبكة المنتجات |
| D5 | `src/components/pos/POSCart.tsx` | سلة الفاتورة |
| D6 | `src/components/pos/POSPaymentModal.tsx` | نافذة الدفع |
| D7 | `src/components/pos/POSReceiptPrint.tsx` | طباعة إيصال 80mm |
| D8 | `src/hooks/useBarcodeScanner.ts` | Barcode scanner |
| D9 | `src/app/(dashboard)/inventory/products/page.tsx` | قائمة الأصناف |
| D10 | `src/app/(dashboard)/inventory/products/new/page.tsx` | إضافة صنف |
| D11 | `src/app/(dashboard)/inventory/products/[id]/page.tsx` | تفاصيل الصنف |
| D12 | `src/app/(dashboard)/inventory/categories/page.tsx` | الفئات |
| D13 | `src/components/products/ProductForm.tsx` | نموذج الصنف |
| D14 | `src/components/products/BarcodeLabel.tsx` | ملصق الباركود |
| D15 | `src/hooks/useProducts.ts` | React Query hook |
| D16 | `src/hooks/usePOS.ts` | POS Logic hook |
| D17 | `src/lib/actions/products.ts` | Server Actions للمنتجات |
| D18 | `src/lib/actions/pos.ts` | Server Action: إتمام البيع |

---

## ⚠️ قواعد صارمة

1. **شاشة POS لا تُشغّل أي server request أثناء تفاعل المستخدم** — كل الأصناف محملة مسبقاً
2. **إتمام البيع يجب أن يكتمل في < 3 ثواني** — transaction atomic في Supabase
3. **لا تُعدّل المخزون مباشرة** — كل تعديل يمر عبر `invoice_items` والـ Trigger
4. POS يعمل حتى على Tablet (شاشة 768px)
5. ✅ **قرار D11:** الشيفت اختياري — **`shift_id` nullable في `invoices`** — الكاشير يبيع بدون فتح شيفت
6. ✅ **قرار D10:** طباعة 80mm = CSS + `window.print()` فقط — **لا** `@point-of-sale/react-thermal-printer`
7. اختبر: باركود مكرر، كمية أكبر من المخزون، عميل بحد ائتمان منتهٍ

---

## 🔗 تعتمد على

- Agent-01: TypeScript types + Schema
- Agent-02: authStore, plan limits, user context
- Agent-03: DataTable, SearchInput, PageHeader, shadcn components
