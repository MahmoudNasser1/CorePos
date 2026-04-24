# 🚀 Pos-Sahl — دليل إعداد بيئة التطوير

> **التقنية:** Next.js 15 + NestJS + PostgreSQL (Drizzle) | **التاريخ:** 17 أبريل 2026

---

## المتطلبات

| الأداة | الإصدار | الغرض |
|-------|---------|-------|
| Node.js | v20+ | تشغيل Next.js |
| npm / pnpm | أحدث إصدار | إدارة المكتبات |
| Git | أي إصدار | إدارة الكود |
| VS Code | أي إصدار | المحرر المقترح |
| PostgreSQL | أي (محلي/سيرفر) | قاعدة البيانات |
| حساب Vercel | مجاني | الاستضافة |

---

## الخطوة 1: إنشاء مشروع Next.js

```bash
# إنشاء مشروع جديد
npx create-next-app@latest pos-sahl \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd pos-sahl
```

---

## الخطوة 2: تثبيت المكتبات

```bash
# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react class-variance-authority clsx tailwind-merge

# shadcn/ui (نثبتها بالأوامر)
npx shadcn@latest init

# State Management
npm install zustand @tanstack/react-query

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Printing
npm install jspdf html2canvas   # A4 PDF
npm install @point-of-sale/react-thermal-printer  # أو بديل ESC/POS

# Barcode
npm install react-barcode        # طباعة باركود
npm install quagga2              # مسح باركود من الكاميرا (اختياري)

# Excel Export
npm install xlsx

# Arabic RTL Support
npm install tailwindcss-rtl

# Date
npm install date-fns

# Charts للتقارير
npm install recharts
```

---

## الخطوة 3: تشغيل الباكند (NestJS)

```bash
# من جذر المشروع
npm run backend:dev
```

---

## الخطوة 4: متغيرات البيئة

```bash
# أنشئ ملف .env.local في جذر المشروع
```

```env
# .env.local

# App
NEXT_PUBLIC_APP_NAME=Pos-Sahl
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## الخطوة 5: هيكل الملفات

```
pos-sahl/
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── (auth)/                   ← مجموعة صفحات Auth
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              ← مجموعة صفحات التطبيق
│   │   │   ├── layout.tsx            ← Layout عام + Sidebar
│   │   │   ├── page.tsx              ← Dashboard الرئيسية
│   │   │   ├── pos/
│   │   │   │   └── page.tsx          ← شاشة POS
│   │   │   ├── inventory/
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx      ← قائمة الأصناف
│   │   │   │   │   ├── new/page.tsx  ← إضافة صنف
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx  ← تفاصيل الصنف
│   │   │   │   │       └── edit/page.tsx
│   │   │   │   └── categories/page.tsx
│   │   │   ├── sales/
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── quotations/
│   │   │   │   └── returns/
│   │   │   ├── purchases/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── finance/
│   │   │   │   ├── treasury/
│   │   │   │   ├── receipts/
│   │   │   │   ├── payments/
│   │   │   │   └── expenses/
│   │   │   ├── reports/
│   │   │   │   ├── daily/page.tsx
│   │   │   │   ├── sales-analysis/page.tsx
│   │   │   │   ├── profits/page.tsx
│   │   │   │   ├── stock/page.tsx
│   │   │   │   ├── product-movement/page.tsx
│   │   │   │   ├── customer-balances/page.tsx
│   │   │   │   ├── supplier-balances/page.tsx
│   │   │   │   └── treasury-movement/page.tsx
│   │   │   └── settings/
│   │   │       ├── company/page.tsx
│   │   │       ├── branches/page.tsx
│   │   │       ├── warehouses/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── print-settings/page.tsx
│   │   │
│   │   ├── api/                      ← API Routes
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── invoices/
│   │   │   ├── reports/
│   │   │   └── print/               ← ESC/POS طباعة
│   │   │
│   │   ├── layout.tsx               ← Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                      ← shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── pos/
│   │   │   ├── POSSearch.tsx        ← بحث + باركود
│   │   │   ├── POSProductGrid.tsx   ← شبكة المنتجات
│   │   │   ├── POSCart.tsx          ← سلة الفاتورة
│   │   │   ├── POSCartItem.tsx
│   │   │   ├── POSPaymentModal.tsx  ← نافذة الدفع
│   │   │   └── POSReceiptPrint.tsx  ← طباعة الإيصال
│   │   ├── invoices/
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoiceItemRow.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   └── InvoicePrint.tsx
│   │   ├── products/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   └── BarcodeLabel.tsx
│   │   ├── reports/
│   │   │   ├── ReportTable.tsx
│   │   │   ├── ReportFilters.tsx
│   │   │   └── SalesChart.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── SearchInput.tsx
│   │       ├── DateRangePicker.tsx
│   │       └── ExportButton.tsx
│   │
│   ├── lib/
│   │   ├── api/                    ← Backend adapters
│   │   │   ├── backend-client.ts   ← backendFetch wrapper
│   │   │   └── user.ts             ← getBackendSession
│   │   ├── utils.ts                ← cn() و formatCurrency() وغيرها
│   │   ├── constants.ts            ← ثوابت المشروع
│   │   └── validations/            ← Zod schemas
│   │       ├── product.ts
│   │       ├── invoice.ts
│   │       └── customer.ts
│   │
│   ├── hooks/
│   │   ├── useProducts.ts          ← TanStack Query للأصناف
│   │   ├── useInvoices.ts
│   │   ├── useCustomers.ts
│   │   ├── usePOS.ts               ← منطق شاشة POS
│   │   └── usePrint.ts             ← طباعة الفواتير
│   │
│   ├── stores/
│   │   ├── posStore.ts             ← Zustand: حالة شاشة POS
│   │   ├── authStore.ts            ← Zustand: المستخدم الحالي
│   │   └── settingsStore.ts        ← Zustand: إعدادات المشروع
│   │
│   └── types/
│       ├── auth.types.ts
│       └── pos.types.ts
│
├── public/
│   └── fonts/                      ← خطوط عربية
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## الخطوة 6: إعداد Backend API Client

العميل موجود بالفعل داخل المشروع:
- `src/lib/api/backend-client.ts`
- `src/lib/api/user.ts`

---

## الخطوة 7: إعداد Tailwind RTL

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
      colors: {
        primary: { /* ألوان المشروع */ },
      }
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}
export default config
```

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');

:root {
  direction: rtl;
}

body {
  font-family: 'Cairo', sans-serif;
}
```

---

## الخطوة 8: إعداد Middleware للحماية

`src/middleware.ts` يعتمد على جلسة الباكند (cookies).

---

## الخطوة 9: تشغيل المشروع

```bash
# تشغيل بيئة التطوير
npm run dev

# يفتح على: http://localhost:3000
```

---

## إعداد shadcn/ui (مكونات UI)

```bash
# تثبيت المكونات المطلوبة
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add sheet
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add popover
npx shadcn@latest add calendar
```

---

## نشر على Vercel

```bash
# تثبيت Vercel CLI
npm install -g vercel

# رفع المشروع
vercel

# إضافة متغيرات البيئة
# اذهب إلى vercel.com → Project Settings → Environment Variables
# أضف:
#   BACKEND_API_URL (لو محتاج)
```

---

## المجلدات والملفات الأولى للبدء

**ابدأ بهذا الترتيب:**

```
1️⃣  إعداد PostgreSQL + تشغيل الباكند
2️⃣  متغيرات البيئة (.env.local)
3️⃣  Backend client + Middleware
4️⃣  صفحة Login + Auth
5️⃣  Layout + Sidebar
6️⃣  CRUD الأصناف (Products)
7️⃣  شاشة POS ← الأهم
8️⃣  فواتير المبيعات
9️⃣  المشتريات + الخزينة
🔟  التقارير
```
