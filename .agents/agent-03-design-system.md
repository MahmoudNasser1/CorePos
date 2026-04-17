# 🎨 Agent 03 — Design System & UI Foundation Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Agent-01 (موازي مع Agent-02)

---

## 🎯 مهمتك الأساسية

أنت مهندس الواجهة والتصميم. مسؤوليتك بناء **Design System عربي احترافي + Layout الرئيسي + المكونات المشتركة** التي يستخدمها كل الـ Agents الأخرى.

**مهم جداً:** لا تبني أي صفحة وظيفية. فقط الأساس والمكونات المشتركة.

---

## 🛠️ الـ Skills المطلوبة

```
@frontend-design
@tailwind-patterns
@shadcn
@design-spells
@react-patterns
@mobile-design
@iconsax-library
```

---

## 📋 المهام التفصيلية

### 1. إعداد المشروع الأساسي

```bash
# إنشاء مشروع Next.js 15
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

# تثبيت shadcn/ui
npx shadcn@latest init

# تثبيت المكتبات
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
npm install recharts
npm install date-fns
npm install xlsx
npm install clsx tailwind-merge class-variance-authority
```

### 2. Design System — الألوان والخطوط

```css
/* src/app/globals.css */
/* النظام الكامل */

/* الخط العربي */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');

:root {
  /* الألوان الأساسية — CorePOS Brand */
  --primary: 222 75% 35%;       /* أزرق داكن احترافي */
  --primary-light: 222 75% 50%;
  --accent: 142 70% 40%;        /* أخضر للنجاح والأرباح */
  --danger: 0 75% 50%;         /* أحمر للتحذيرات */
  --warning: 38 92% 50%;        /* برتقالي للتنبيهات */

  /* الخلفيات */
  --background: 220 30% 97%;
  --surface: 0 0% 100%;
  --surface-2: 220 20% 94%;
  --border: 220 15% 88%;

  /* النصوص */
  --text-primary: 222 30% 15%;
  --text-secondary: 222 15% 45%;
  --text-muted: 222 10% 65%;

  /* الـ spacing والـ radius */
  --radius: 0.75rem;
  --radius-sm: 0.5rem;
  --radius-lg: 1rem;
}

/* وضع داكن */
[data-theme="dark"] { ... }

/* RTL Global */
* { direction: rtl; }
body { font-family: 'Cairo', sans-serif; }
```

### 3. shadcn/ui Components المطلوبة

```bash
npx shadcn@latest add button input label
npx shadcn@latest add dialog sheet
npx shadcn@latest add select command popover
npx shadcn@latest add table
npx shadcn@latest add card badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add toast sonner
npx shadcn@latest add tabs separator scroll-area
npx shadcn@latest add calendar date-picker
npx shadcn@latest add progress skeleton
npx shadcn@latest add alert alert-dialog
npx shadcn@latest add tooltip
```

### 4. Layout الرئيسي

**`src/app/(dashboard)/layout.tsx`:**
```
┌─────────────────────────────────────────────────────────┐
│  Header (ثابت في الأعلى)                                │
│  [CorePOS Logo] ... [🔔 تنبيهات] [👤 اسم المستخدم ▼]   │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │                                              │
│ (ثابت   │         المحتوى الرئيسي                      │
│  يسرة)  │         {children}                           │
│          │                                              │
│  قائمة  │                                              │
│  عمودية │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Sidebar يحتوي:**
- شعار CorePOS
- روابط: الرئيسية، POS، مخزون، مبيعات، مشتريات، عملاء، موردون، خزينة، تقارير، إعدادات
- Badge للتنبيهات (مخزون منخفض، فواتير متأخرة)
- معلومات المستخدم + زر تسجيل الخروج
- مؤشر الاشتراك (النسبة المستخدمة)

**`src/app/(dashboard)/layout.tsx` Mobile:**
- على الموبايل: Sidebar يختفي → يظهر Bottom Navigation
- 5 تبويبات: الرئيسية، POS، مخزون، تقارير، المزيد

### 5. المكونات المشتركة (Shared Components)

**`src/components/shared/`:**

```typescript
// DataTable.tsx — جدول بيانات ذكي
// Props: columns, data, searchable, filterable, exportable
// Features: بحث، تصفية، ترقيم صفحات، تصدير Excel

// SearchInput.tsx — بحث سريع مع باركود
// Props: onSearch, onBarcode, placeholder

// DateRangePicker.tsx — اختيار فترة زمنية
// مع اختصارات: اليوم، هذا الأسبوع، هذا الشهر، الشهر السابق

// StatCard.tsx — كارت الإحصاء
// Props: title, value, change, changeType, icon, color

// PageHeader.tsx — رأس كل صفحة
// Props: title, subtitle, actions

// EmptyState.tsx — حالة الجدول الفارغ
// Props: icon, title, description, action

// ConfirmDialog.tsx — تأكيد الحذف والإلغاء
// RTL-aware

// ExportButton.tsx — تصدير Excel/PDF
// Props: data, filename, type

// LoadingSpinner.tsx + LoadingSkeleton.tsx

// StatusBadge.tsx — badge حالة الفاتورة
// مدفوع / جزئي / آجل / ملغى

// CurrencyDisplay.tsx — عرض المبالغ
// مع العملة والألوان (أخضر للربح، أحمر للخسارة)

// ArabicNumberInput.tsx — حقل أرقام يدعم Arabic numerals
```

### 6. Marketing Layout (Landing Page)

**`src/app/(marketing)/layout.tsx`:**
- Navbar مختلف: شعار + روابط + زر "جرّب مجاناً"
- Footer بمعلومات الشركة

**`src/app/(marketing)/page.tsx` — Landing Page:**
```
Hero: "CorePOS — بيع أسرع، اعرف أكثر"
  + CTA كبير "ابدأ مجاناً 14 يوم"
  + صورة Dashboard معاينة

Features: 6 ميزات رئيسية مع أيقونات
Pricing: مقارنة الخطط الثلاث
Testimonials: شهادات (placeholder)
CTA: "ابدأ الآن"
```

### 7. الـ Tailwind Config العربي

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      arabic: ['Cairo', 'sans-serif'],
    },
    // RTL-aware spacing
  }
}
// ملاحظة: Tailwind v4 يدعم RTL نيتيفلي
```

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف | الوصف |
|---|-------|-------|
| D1 | `src/app/globals.css` | Design System كامل |
| D2 | `tailwind.config.ts` | RTL + Custom tokens |
| D3 | `src/app/(dashboard)/layout.tsx` | Layout مع Sidebar |
| D4 | `src/components/layout/Sidebar.tsx` | Sidebar كامل |
| D5 | `src/components/layout/Header.tsx` | Header كامل |
| D6 | `src/components/layout/MobileNav.tsx` | Navigation للـ Mobile |
| D7 | `src/app/(marketing)/layout.tsx` | Marketing layout |
| D8 | `src/app/(marketing)/page.tsx` | Landing Page |
| D9 | `src/app/(marketing)/pricing/page.tsx` | صفحة الأسعار |
| D10 | `src/components/shared/*.tsx` | كل المكونات المشتركة |
| D11 | `src/lib/utils.ts` | cn(), formatCurrency() وغيرها |
| D12 | `src/hooks/useRTL.ts` | RTL detection hook |
| D13 | `next.config.ts` | إعدادات Next.js |
| D14 | `.env.example` | قالب متغيرات البيئة |

---

## ⚠️ قواعد صارمة

1. **كل نص في الواجهة بالعربية** — لا كلمة إنجليزية مرئية
2. **RTL أولاً** — استخدم `start/end` بدلاً من `left/right`
3. **Mobile-first** — الـ Sidebar يتحول لـ Bottom Nav على الشاشات الصغيرة
4. **لا Hardcoded colors** — كل شيء من CSS variables
5. **Accessibility** — كل button له `aria-label`, كل input له `label`
6. لا تنشئ أي صفحة وظيفية (POS, Inventory, Reports) — فقط المكونات المشتركة والـ Layout

---

## 🔗 تعتمد على

- Agent-01: لمعرفة الـ TypeScript Types المتاحة
- لا يعتمد على Agent-02 (يعملان موازيين)
