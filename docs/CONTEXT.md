# 🧭 CorePOS — CONTEXT (اقرأ هذا أولاً قبل أي شيء)

> **الإصدار:** 1.0 | **آخر تحديث:** 18 أبريل 2026
> **⚠️ قاعدة:** هذا الملف يُقرأ أولاً في كل محادثة — قبل ملف الـ Agent الخاص بك.

---

## 1. هوية المشروع

| # | البند | القيمة |
|---|-------|--------|
| الاسم | CorePOS | نظام SaaS متعدد المستأجرين لنقاط البيع والمخزون |
| السوق | مصر والسوق العربي | محلات الموبايلات، قطع الغيار، التجزئة العامة |
| المرحلة الحالية | MVP | لا توسع قبل استكمال MVP |

## 2. Tech Stack (لا تتغير بدون قرار صريح)

```
Frontend:    Next.js 15 (App Router) — TypeScript Strict
Styling:     Tailwind CSS v4 + shadcn/ui
Font:        Cairo (Google Fonts) — RTL دائماً
Database:    PostgreSQL
Auth:        Backend Sessions (cookies)
Storage:     (اختياري لاحقاً)
State:       Zustand (global) + useState (local فقط)
Icons:       Lucide React
```

## 3. Backend API (NestJS)

```
Backend:          apps/backend (NestJS + Drizzle)
DB:               PostgreSQL
```

## 4. المسار الجذر للمشروع

```
/home/eldrwal/Desktop/Pos-Sahl/
├── src/
│   ├── app/          ← Next.js App Router
│   ├── components/   ← UI Components
│   ├── stores/       ← Zustand Stores
│   ├── lib/          ← Utilities + Backend client
│   └── types/        ← database.types.ts (من Agent-01)
├── apps/backend/     ← NestJS backend (Drizzle)
├── docs/             ← الوثائق
└── .agents/          ← تعليمات كل Agent
```

## 5. القرارات المُقفَلة (لا تناقشها — طبّقها)

| كود | القرار | التفصيل |
|-----|--------|---------|
| D2 | Next.js 15 App Router | لا Pages Router |
| D3 | Shared DB + Tenant enforcement | `company_id` في كل جدول |
| D6 | رقم الفاتورة | `YYMM-NNN` مثال: `2604-001` |
| D7 | Barcode unique | لكل شركة فقط (company_id, barcode) |
| D8 | No Offline في MVP | Online فقط، optimistic UI |
| D9 | Billing يدوي | WhatsApp — لا Paymob في MVP |
| D10 | طباعة 80mm | CSS + window.print() فقط |
| D11 | Shift اختياري | shift_id nullable |
| D12 | Backend-first | NestJS + Drizzle |
| D13 | الأرقام والتواريخ | أرقام غربية 1234 + ميلادي فقط |

## 6. خارطة مخرجات الـ Agents (Input/Output Map)

```
Agent-01 يُنتج → يستخدمه
─────────────────────────────────────────────
src/types/database.types.ts    → الجميع
.env.local                     → الجميع
apps/backend/src/common/db/schema.ts → الجميع

Agent-02 يُنتج → يستخدمه
─────────────────────────────────────────────
src/lib/api/backend-client.ts  → الجميع
src/stores/authStore.ts        → 04, 05, 06
src/lib/plan-limits.ts         → 04, 05, 06
src/middleware.ts              → النظام كله

Agent-03 يُنتج → يستخدمه
─────────────────────────────────────────────
src/app/(dashboard)/layout.tsx → 04, 05, 06
src/components/shared/*        → 04, 05, 06
src/lib/utils.ts               → الجميع
globals.css                    → الجميع

Agent-04 يُنتج → يستخدمه
─────────────────────────────────────────────
src/components/products/ProductSearchInput.tsx → 05

Agent-13 يُنتج → يستخدمه (🆕 User Management)
─────────────────────────────────────────────
apps/backend/src/modules/admin/*              → Frontend settings/users
apps/backend/src/common/rbac/permission.guard → كل الـ modules
apps/backend/src/common/rbac/permission-keys  → Policy evaluator + Guards
src/app/(dashboard)/settings/users/page.tsx   → Dashboard settings
src/components/settings/UsersManagement.tsx   → Users page
src/lib/api/admin.ts                          → Settings actions
docs/plans/USER_MANAGEMENT_MASTER_PLAN.md     → خطة التنفيذ المرجعية

Agent-15 يُنتج → يستخدمه (🆕 Admin System Architect)
─────────────────────────────────────────────
apps/backend/src/modules/billing/*             → Billing API + اشتراكات
apps/backend/src/common/rbac/permission.guard  → حماية كل endpoints إداري
apps/backend/src/common/rbac/require-permission.decorator → كل Controller
apps/backend/src/common/db/schema.ts           → user_roles + company_audit_logs + payment_invoices
src/app/(dashboard)/settings/users/page.tsx    → صفحة المستخدمين
src/components/settings/UsersManagement.tsx    → Client component
src/hooks/use-permissions.ts                   → Frontend permission check
src/lib/plan-limits.ts                         → تفعيل حدود الاشتراك الحقيقية
docs/plans/ADMIN_SYSTEM_MASTER_PLAN.md         → خطة التنفيذ الشاملة (6 مراحل)
docs/plans/ADMIN_SYSTEM_PRD.md                 → PRD المهمة + User Stories + معايير القبول
.agents/agent-15-admin-system.md               → تعليمات الـ Agent المنفّذ
```

## 7. ثوابت لا تُكسَر

```typescript
// العملة — دائماً
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ج.م'

// الأرقام: غربية دائماً 1234 (لا ١٢٣٤)
// التاريخ: ميلادي فقط
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ar-EG', {
    numberingSystem: 'latn',  // ← غربي دائماً
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(date)

// RTL — كل صفحة
<html lang="ar" dir="rtl">
```

## 8. Import Paths الموحدة

```typescript
// دائماً استخدم absolute paths
import { useAuthStore }  from '@/stores/authStore'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Company, Profile } from '@/types/auth.types'

// لا relative paths من خارج نفس الـ folder
// ❌ import { X } from '../../../lib/utils'
// ✅ import { X } from '@/lib/utils'
```

## 9. Git Branch Convention

```
main            ← protected (Orchestrator يدمج فقط)
agent/01-db     ← Agent-01 يشتغل هنا
agent/02-auth   ← Agent-02 يشتغل هنا
agent/03-design ← Agent-03 يشتغل هنا
agent/04-pos    ← Agent-04 يشتغل هنا
agent/05-sales  ← Agent-05 يشتغل هنا
agent/06-reports← Agent-06 يشتغل هنا
```

## 10. اقرأ هذا بعده مباشرة

👉 ملف الـ Agent الخاص بك في `.agents/agent-XX-name.md`
