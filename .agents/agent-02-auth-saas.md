# 🔐 Agent 02 — Auth, SaaS & Onboarding Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Agent-01

---

## 🎯 مهمتك الأساسية

أنت مهندس المصادقة والـ SaaS. مسؤوليتك بناء **منظومة تسجيل الدخول، الـ Onboarding، إدارة الاشتراكات، وحماية الـ Routes** بالكامل.

---

## 🛠️ الـ Skills المطلوبة

```
@nextjs-supabase-auth
@nextjs-best-practices
@react-patterns
@zod-validation-expert
@gdpr-data-handling
@security-auditor
```

---

## 📋 المهام التفصيلية

### 1. Supabase Auth Client Setup

```typescript
// src/lib/supabase/client.ts — Browser client
// src/lib/supabase/server.ts — Server client (Server Components + API Routes)
// src/lib/supabase/middleware.ts — Auth helper
```

### 2. Next.js Middleware (Route Protection)

```typescript
// src/middleware.ts
// يحمي:
// - /dashboard/** → مستخدم مسجل + اشتراك نشط
// - /super-admin/** → platform_admin فقط
// - /billing/** → مستخدم مسجل
// يسمح:
// - / , /pricing, /login, /register, /api/webhooks/**
```

**منطق التحقق الكامل:**
1. هل المستخدم مسجل؟
2. هل هو في قاعدة `profiles` ومرتبط بشركة؟
3. هل اشتراك الشركة في حالة `active` أو `trialing`؟
4. إذا `trialing` وانتهت المدة → `/billing/expired`
5. إذا `past_due` → تحذير + توجيه للدفع

### 3. صفحات Auth

**`/register` — تسجيل جديد:**
- حقول: الاسم الكامل + البريد + كلمة المرور + تأكيد كلمة المرور
- Zod validation كاملة
- بعد التسجيل: إرسال بريد تأكيد (Supabase) → `/verify-email`
- بعد التأكيد: `→ /onboarding/company`

**`/login` — تسجيل دخول:**
- بريد + كلمة مرور
- "تذكّرني" — 30 يوم
- نسيت كلمة المرور → `/forgot-password`
- بعد الدخول: يتحقق هل Onboarding مكتمل؟
  - مكتمل → `/dashboard`
  - غير مكتمل → `/onboarding/company`

**`/forgot-password`:**
- إرسال reset email عبر Supabase
- صفحة `/reset-password?token=...` لإعادة التعيين

### 4. Onboarding Flow (3 خطوات)

**Step 1: `/onboarding/company`**
```typescript
// يُنشئ record في: companies + branches (افتراضي) + warehouses (افتراضي)
// يُنشئ subscription تجريبي (Trigger تلقائي من DB)
// الحقول: اسم الشركة, نوع النشاط, تليفون, عملة, نسبة الضريبة
```

**Step 2: `/onboarding/warehouse`** (اختياري — تخطي مسموح)
```typescript
// اسم المخزن الرئيسي (default: "المخزن الرئيسي")
// اسم الفرع الرئيسي (default: "الفرع الرئيسي")
```

**Step 3: `/onboarding/complete`**
```typescript
// شاشة ترحيب + زر "ابدأ الآن → /dashboard"
// عرض: الفترة التجريبية (14 يوم)، الخطة الحالية
```

### 5. صفحة Billing `/billing`

**`/billing` — حالة الاشتراك:**
- عرض الخطة الحالية + تاريخ الانتهاء
- Progress bars للاستخدام (مستخدمون / أصناف / فواتير / تخزين)
- زر "ترقية الخطة"
- جدول `billing_history`

**`/billing/upgrade` — ترقية الخطة:**
✅ **قرار D9:** الدفع يدوي في MVP — لا Paymob في المرحلة الأولى
- عرض مقارنة الخطط (مثل صفحة Pricing)
- زر كبير: **"اتصل بنا للاشتراك"** → يفتح WhatsApp أو Call
- توضيح: "سيتولى فريقنا تفعيل الاشتراك خلال ساعة"
- **لا** تبني أي payment form الآن

**`/billing/expired` — اشتراك منتهٍ:**
- رسالة واضحة + زر "جدد اشتراكك"
- يسمح بـ: عرض البيانات (read-only) + تصدير
- يمنع: إضافة أي بيانات جديدة

### 6. Plan Limits Middleware (Server-side)

```typescript
// src/lib/plan-limits.ts
// دوال:
// canAddUser(companyId) → boolean
// canAddBranch(companyId) → boolean
// canAddProduct(companyId) → boolean
// canCreateInvoice(companyId) → boolean
// hasFeature(companyId, 'reports_advanced') → boolean
// getLimitsInfo(companyId) → PlanLimitsInfo
```

### 7. Zustand Auth Store

```typescript
// src/stores/authStore.ts
// State:
// - user: User | null
// - profile: Profile | null
// - company: Company | null
// - subscription: Subscription | null
// - plan: Plan | null
// - limits: PlanLimitsInfo | null
// - isLoading: boolean
```

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف | الوصف |
|---|-------|-------|
| D1 | `src/middleware.ts` | Route protection كامل |
| D2 | `src/lib/supabase/client.ts` | Browser Supabase client |
| D3 | `src/lib/supabase/server.ts` | Server Supabase client |
| D4 | `src/app/(auth)/login/page.tsx` | صفحة الدخول |
| D5 | `src/app/(auth)/register/page.tsx` | صفحة التسجيل |
| D6 | `src/app/(auth)/forgot-password/page.tsx` | نسيت كلمة المرور |
| D7 | `src/app/(onboarding)/**` | 3 خطوات Onboarding كاملة |
| D8 | `src/app/billing/**` | صفحات الاشتراك كاملة |
| D9 | `src/lib/plan-limits.ts` | Plan limits checker |
| D10 | `src/stores/authStore.ts` | Zustand Auth store |
| D11 | `src/types/auth.types.ts` | TypeScript types للـ Auth |

---

## ⚠️ قواعد صارمة

1. **لا تُخزّن API keys في الـ client-side** — فقط `NEXT_PUBLIC_` المسموح
2. كل صفحة Auth يجب أن تدعم **RTL عربي 100%**
3. **جميع الرسائل بالعربية** (أخطاء Validation، تنبيهات، نجاح)
4. استخدم `react-hook-form` + `zod` لكل الـ forms
5. لا تُستخدم Server Actions للـ Auth — استخدم Client-side Supabase auth
6. اختبر كل سيناريو: trial منتهي، اشتراك ملغى، تجاوز الحدود

---

## 🔗 تعتمد على

- Agent-01: يجب أن تكون DB Schema جاهزة أولاً
- ملف: [saas_layer_schema.sql](../docs/saas_layer_schema.sql)
- ملف: [saas_architecture.md](../docs/saas_architecture.md)
