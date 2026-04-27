# 🔍 تقرير شامل — حالة النظام الإدارية + خطة الاستكمال

> **التاريخ:** 27 أبريل 2026 | **المشروع:** Pos-Sahl  
> **الهدف:** تقييم كامل لـ: داشبورد الأدمن، الصلاحيات، الاشتراكات، الدفع، والتحكم الكامل في مفاصل السيستم

---

## 📊 ملخص سريع — حالة كل محور

| المحور | الحالة | النسبة | التفاصيل |
|--------|--------|--------|----------|
| **🏢 Super Admin Dashboard** | ✅ شبه مكتمل | ~85% | overview + companies + users + rbac + audit + org |
| **🏪 Company Admin Dashboard** | ⚠️ جزئي | ~50% | settings (فروع/مخازن/شركة/طباعة) — بدون users/roles |
| **👥 إدارة المستخدمين (Company)** | 🔴 ناقص | ~15% | `GET /admin/users` فقط — لا CRUD |
| **🔐 نظام الصلاحيات RBAC** | ⚠️ بنية فقط | ~30% | جداول + PolicyEvaluator موجود لكن **غير مُفعّل** |
| **💳 الاشتراكات والدفع** | ⚠️ هيكل فقط | ~25% | جداول plans/subscriptions + صفحات billing (بدون بوابة دفع) |
| **📝 Audit Logs (Company)** | 🔴 فارغ | ~5% | الصفحة موجودة تُرجّع `[]` — لا جدول ولا backend |
| **🌐 Marketing / Landing** | ✅ جزئي | ~40% | Landing + pricing + terms + privacy (بدون features/blog) |
| **🔒 حماية المسارات Middleware** | ✅ يعمل | ~70% | JWT + subscription check + super-admin guard |

---

## 1️⃣ Super Admin Dashboard (`/super-admin/`)

### ✅ ما هو موجود ويعمل

| الصفحة | الـ Backend | الحالة |
|--------|-----------|--------|
| `/super-admin/` (Overview) | `GET /platform-admin/overview` → إحصائيات الشركات + المستخدمين + الاشتراكات | ✅ يعمل |
| `/super-admin/companies` | `GET /platform-admin/companies` + `PATCH .../subscription` | ✅ يعمل + تعديل الاشتراك |
| `/super-admin/users` | `GET/PATCH /platform-admin/users` + `POST .../reset-password` | ✅ يعمل (enable/disable/reset/orgUnit) |
| `/super-admin/rbac` | `GET/PATCH /platform-admin/rbac` → snapshot + patch role perms/overrides | ✅ يعمل |
| `/super-admin/org` | `GET/POST/PATCH/DELETE /platform-admin/org-units` | ✅ يعمل |
| `/super-admin/audit-logs` | `GET /platform-admin/audit-logs` + CSV export | ✅ يعمل |

### 🟡 ما ينقصه

| العنصر | الحالة | الأهمية |
|--------|--------|---------|
| إحصائيات الإيرادات (Revenue) | ❌ غير موجود — الـ overview لا يحتوي MRR/ARR | 🟡 متوسطة |
| `/super-admin/subscriptions` — صفحة مخصصة | ❌ مخطط في الـ PRD لكن لم يُبنى | 🟡 متوسطة |
| `/super-admin/billing` — الإيرادات | ❌ غير موجود | 🟡 متوسطة |
| `/super-admin/trials` — الفترات التجريبية | ❌ غير موجود | 🟢 منخفضة |
| `/super-admin/support` — تذاكر الدعم | ❌ غير موجود | 🟢 منخفضة |
| تنبيهات الشركات التي تنتهي تجربتها | ❌ غير موجود | 🟡 متوسطة |

---

## 2️⃣ Company Admin Dashboard (`/dashboard/settings/`)

### ✅ ما هو موجود ويعمل

| الصفحة | الـ Backend | الحالة |
|--------|-----------|--------|
| `/settings/company` | `GET/POST /admin/company` | ✅ يعمل |
| `/settings/branches` | `GET/POST/PATCH /admin/branches` | ✅ يعمل |
| `/settings/warehouses` | `GET/POST/PATCH /admin/warehouses` | ✅ يعمل |
| `/settings/variables` | Frontend فقط (فئات + وحدات) | ✅ يعمل |
| `/settings/invoice` | Frontend فقط | ✅ يعمل |
| `/settings/printing` | `GET/POST/PATCH/DELETE /admin/print-*` | ✅ يعمل |

### 🔴 ما ينقصه

| العنصر | الحالة | الأهمية |
|--------|--------|---------|
| **`/settings/users`** — إدارة المستخدمين | ❌ **الصفحة غير موجودة + 5 endpoints ناقصة** | 🔴 حرج |
| **`/settings/roles`** — إدارة الأدوار | ❌ غير موجود | 🟡 متوسطة |
| `/settings/payment-methods` — طرق الدفع | ❌ غير موجود (جدول في DB لكن لا صفحة) | 🟡 متوسطة |
| `/settings/taxes` — إعدادات الضرائب | ❌ غير موجود (vatRate في company فقط) | 🟢 منخفضة |
| `/settings/backup` — النسخ الاحتياطي | ❌ غير موجود | 🟢 منخفضة |
| تاب "المستخدمون" في `SettingsNav` | ❌ غير مُضاف | 🔴 حرج |

---

## 3️⃣ نظام الصلاحيات RBAC

### ✅ ما هو موجود

```
📁 apps/backend/src/common/rbac/
├── permission-keys.ts         → 13 مفتاح صلاحية معرّف
└── policy-evaluator.service.ts → getEffectivePermissions() ← موجود لكن غير مُستخدم!

📁 apps/backend/src/common/db/schema.ts
├── roles                → جدول الأدوار (name, companyId)
├── rolePermissions       → جدول صلاحيات الأدوار (roleId, permissionKey)
└── userPermissionOverrides → جدول استثناءات المستخدم (userId, companyId, key, effect)
```

### 🔴 ما ينقصه

| العنصر | التفصيل |
|--------|---------|
| **PermissionGuard** | ❌ **لا يوجد Guard** — كل الـ endpoints مفتوحة لأي مستخدم مسجل! |
| **`@RequirePermission()` Decorator** | ❌ غير موجود |
| **جدول `user_roles`** | ❌ لا يوجد ربط مستخدم ↔ دور في DB (الكود يعتمد على `profiles.role` نص حر) |
| **تفعيل PolicyEvaluator** | ❌ `getEffectivePermissions()` لا يُستدعى من أي مكان |
| **Permission Keys كافية** | ⚠️ 13 مفتاح فقط — ينقصه: `admin.users.read`, `admin.roles.manage`, `admin.audit.read`, `sales.void`, `sales.discount`, `contacts.read/write`, `purchases.read/write` |
| **Frontend Permission Check** | ❌ لا يوجد — كل الأزرار ظاهرة لكل المستخدمين |

> **⚠️ خطورة أمنية:** حالياً أي مستخدم (حتى cashier) يقدر يدخل `/dashboard/settings` ويعدّل بيانات الشركة!

---

## 4️⃣ الاشتراكات والدفع

### ✅ ما هو موجود

```
📁 Database (schema.ts):
├── plans         → id, name, monthlyPrice, yearlyPrice, lifetimePrice, limits
└── subscriptions → companyId, planId, status, currentPeriodEnd, cancelledAt

📁 Frontend Pages:
├── /billing/            → صفحة الاشتراك الحالي + Usage Metrics ← ✅ موجود (client component)
├── /billing/history     → سجل المدفوعات ← ✅ موجود (فارغ — لا بيانات)
├── /billing/expired     → صفحة انتهاء الاشتراك ← ✅ موجود (WhatsApp + logout)
└── /billing/upgrade     → صفحة الترقية ← ✅ موجود

📁 Backend:
├── PlatformAdminController: PATCH /companies/:id/subscription ← ✅ (super-admin يعدّل الاشتراك يدوياً)
├── AuthService: يقرأ subscription status عند login/session ← ✅
├── OnboardingService: ينشئ subscription بـ status='trialing' عند التسجيل ← ✅
└── Middleware: يفحص subscription status ويعمل redirect لـ /billing/expired ← ✅

📁 Frontend Limits:
└── plan-limits.ts → كل الدوال ترجّع `true` / `null` (Stub — غير مفعّلة!)
```

### 🔴 ما ينقصه

| العنصر | التفصيل | الأهمية |
|--------|---------|---------|
| **بوابة دفع (Payment Gateway)** | ❌ لا يوجد Paymob/Fawry/Stripe — الدفع يدوي عبر واتساب | 🔴 حرج للإنتاج |
| **Webhook للدفع** | ❌ `api/webhooks/payment/route.ts` مخطط لكن غير موجود | 🔴 حرج |
| **Plan Limits Enforcement** | ❌ `plan-limits.ts` كله stubs — لا يمنع تجاوز الحدود | 🔴 حرج |
| **فواتير الدفع (Invoices)** | ❌ لا يوجد إنشاء فاتورة دفع / إيصال | 🟡 متوسطة |
| **تجديد تلقائي** | ❌ لا يوجد Cron/Job للتحقق من انتهاء الاشتراك | 🟡 متوسطة |
| **تنبيهات انتهاء** | ❌ لا يوجد email/notification قبل الانتهاء | 🟡 متوسطة |
| **Backend API لـ billing** | ❌ لا يوجد `GET /billing/current` أو `POST /billing/upgrade` | 🔴 حرج |
| **Self-service upgrade** | ❌ الترقية تتم يدوياً عبر super-admin فقط | 🟡 متوسطة |

---

## 5️⃣ Audit Logs (مستوى الشركة)

| العنصر | الحالة |
|--------|--------|
| **صفحة `/dashboard/audit-logs`** | ✅ موجودة — لكن تُرجّع `[]` |
| **Backend Endpoint `GET /admin/audit-logs`** | ✅ موجود — لكن يُرجّع `[]` (hardcoded) |
| **جدول `company_audit_logs`** | ❌ **غير موجود** في schema.ts |
| **`platform_audit_logs`** | ✅ يعمل (للـ super-admin فقط) |
| **تسجيل عمليات الشركة** | ❌ لا يتم تسجيل أي عملية (CRUD users, settings changes, etc.) |

---

## 6️⃣ حماية المسارات (Middleware)

### ✅ ما يعمل حالياً

| الفحص | الحالة |
|-------|--------|
| JWT Token validation via `/auth/session` | ✅ |
| Redirect to `/login` if unauthenticated | ✅ |
| Redirect to `/onboarding` if no company | ✅ |
| Redirect to `/billing/expired` if subscription expired/cancelled/past_due | ✅ |
| Super-admin route protection (`/super-admin/*`) | ✅ |
| Prevent logged-in users from accessing `/login` or `/register` | ✅ |

### 🔴 ما ينقصه

| الفحص | الحالة |
|-------|--------|
| **حماية `/settings/users` حسب الدور** | ❌ أي مستخدم يقدر يدخل |
| **فحص `isActive` للمستخدم المعطّل** | ❌ المستخدم المعطّل لا يزال يستطيع الدخول |
| **Backend: إزالة `x-company-id` في production** | ❌ headers لا تزال مقبولة |
| **Frontend: إخفاء أزرار حسب الصلاحيات** | ❌ كل شيء ظاهر لكل مستخدم |

---

## 7️⃣ Marketing & Landing

| الصفحة | الحالة |
|--------|--------|
| `/` (Landing Page) | ✅ موجودة (Hero + features + CTA) |
| `/pricing` | ⚠️ ضمن Landing Page (section) — لا صفحة منفصلة |
| `/terms` | ✅ موجودة |
| `/privacy` | ✅ موجودة |
| `/features` | ❌ غير موجودة |
| `/blog` | ❌ غير موجود |
| `/contact` | ❌ غير موجود |
| `/about` | ❌ غير موجود |

---

## 📋 خطة الاستكمال الشاملة

### المرحلة A — إدارة المستخدمين + RBAC (الأولوية 🔴 القصوى)
> **المدة:** 6-8 ساعات | **المرجع:** [`USER_MANAGEMENT_MASTER_PLAN.md`](file:///home/eldrwal/Desktop/Pos-Sahl/docs/plans/USER_MANAGEMENT_MASTER_PLAN.md)

| # | المهمة | Backend | Frontend |
|---|--------|---------|----------|
| A1 | CRUD مستخدمين الشركة | 5 endpoints في `AdminController` | صفحة `/settings/users` + components |
| A2 | تفعيل PermissionGuard | `permission.guard.ts` + `@RequirePermission()` | إخفاء أزرار حسب role |
| A3 | تحسين Permission Keys | إضافة 7+ مفاتيح جديدة | — |
| A4 | جدول `user_roles` | migration + schema update | — |
| A5 | تحديث `PolicyEvaluator` | دعم user_roles + fallback profiles.role | — |
| A6 | حماية المسارات | فحص isActive + إزالة x-company-id | Frontend middleware + role check |

### المرحلة B — Audit Logs للشركة (الأولوية 🟡 عالية)
> **المدة:** 2-3 ساعات

| # | المهمة |
|---|--------|
| B1 | إنشاء جدول `company_audit_logs` في schema + migration |
| B2 | تنفيذ `writeAuditLog()` helper في AdminService |
| B3 | كتابة audit log مع كل عملية CRUD |
| B4 | تفعيل `GET /admin/audit-logs` ببيانات حقيقية |
| B5 | ربط صفحة `/dashboard/audit-logs` بالبيانات |

### المرحلة C — تفعيل نظام الاشتراكات (الأولوية 🟡 عالية)
> **المدة:** 4-6 ساعات

| # | المهمة |
|---|--------|
| C1 | Backend API: `GET /billing/current` — بيانات الاشتراك الحالي + الاستخدام |
| C2 | تفعيل `plan-limits.ts` — ربطه فعلياً بجدول `subscriptions` + `plans` |
| C3 | فرض الحدود: منع إنشاء المزيد من users/products/branches إذا تجاوز الخطة |
| C4 | Cron Job / Scheduled Task: فحص يومي للاشتراكات المنتهية وتحديث status |
| C5 | ربط صفحة `/billing` ببيانات حقيقية (API بدل hardcoded) |
| C6 | تنبيه قبل الانتهاء (toast في الداشبورد أو email) |

### المرحلة D — بوابة الدفع (الأولوية 🟡 متوسطة-عالية)
> **المدة:** 8-12 ساعة (حسب البوابة المختارة)

| # | المهمة |
|---|--------|
| D1 | اختيار بوابة الدفع (Paymob مقترح للسوق المصري) |
| D2 | إنشاء `POST /billing/checkout` — يُنشئ payment intent |
| D3 | إنشاء `POST /api/webhooks/payment` — يستقبل callback من البوابة |
| D4 | تحديث subscription status تلقائياً عند نجاح الدفع |
| D5 | إنشاء فواتير دفع (payment invoices) وتحميلها كـ PDF |
| D6 | صفحة `/billing/upgrade` — ربطها بالدفع الفعلي |
| D7 | ربط `/billing/history` بسجل الدفعات الحقيقية |

### المرحلة E — تحسينات Super Admin (الأولوية 🟢 متوسطة)
> **المدة:** 3-4 ساعات

| # | المهمة |
|---|--------|
| E1 | إضافة إحصائيات الإيرادات (MRR/ARR) في Overview |
| E2 | صفحة `/super-admin/subscriptions` — قائمة كل الاشتراكات مع فلترة |
| E3 | تنبيهات الشركات التي تنتهي تجربتها خلال 3 أيام |
| E4 | صفحة `/super-admin/billing` — تقرير الإيرادات الشهري |

### المرحلة F — صفحات تسويقية إضافية (الأولوية 🟢 منخفضة)
> **المدة:** 2-3 ساعات

| # | المهمة |
|---|--------|
| F1 | `/pricing` — صفحة مقارنة خطط منفصلة |
| F2 | `/features` — تفاصيل الميزات |
| F3 | `/contact` — نموذج تواصل |
| F4 | `/about` — عن المشروع |

---

## 🎯 ترتيب الأولويات المقترح

```
الأسبوع 1:  المرحلة A (إدارة المستخدمين + RBAC)     ← 🔴 الأهم
الأسبوع 1:  المرحلة B (Audit Logs)                     ← 🟡 مرتبطة بـ A
الأسبوع 2:  المرحلة C (تفعيل الاشتراكات)               ← 🟡 أساسي للإنتاج
الأسبوع 2-3: المرحلة D (بوابة الدفع)                   ← 🟡 ضروري قبل الإطلاق
الأسبوع 3:  المرحلة E (تحسين Super Admin)              ← 🟢 تحسين
الأسبوع 3:  المرحلة F (صفحات تسويقية)                  ← 🟢 تحسين
```

> [!IMPORTANT]
> **قرار مطلوب منك يا محمود:**  
> 1. هل نبدأ بالمرحلة A (المستخدمين والصلاحيات) أولاً؟  
> 2. بوابة الدفع: Paymob ولا Fawry ولا Stripe؟  
> 3. هل نبني نظام self-service upgrade ولا نكتفي بالتحويل اليدوي حالياً؟

---

## المراجع

| الملف | الوصف |
|-------|-------|
| [USER_MANAGEMENT_MASTER_PLAN.md](file:///home/eldrwal/Desktop/Pos-Sahl/docs/plans/USER_MANAGEMENT_MASTER_PLAN.md) | خطة تفصيلية لإدارة المستخدمين والصلاحيات |
| [saas_architecture.md](file:///home/eldrwal/Desktop/Pos-Sahl/docs/saas_architecture.md) | معمارية SaaS الكاملة |
| [pos_project_brief_and_prd.md](file:///home/eldrwal/Desktop/Pos-Sahl/docs/pos_project_brief_and_prd.md) | وثيقة المتطلبات الأصلية |
| [api_contract_v1.md](file:///home/eldrwal/Desktop/Pos-Sahl/docs/api_contract_v1.md) | عقد الـ APIs |
| [screens_map.md](file:///home/eldrwal/Desktop/Pos-Sahl/docs/screens_map.md) | خريطة الشاشات |
