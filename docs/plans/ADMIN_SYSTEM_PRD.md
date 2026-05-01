# 📋 PRD — النظام الإداري الكامل (Admin System)

> **المشروع:** CorePOS  
> **الإصدار:** 1.0  
> **التاريخ:** 1 مايو 2026  
> **المالك:** محمود  
> **المنفذ:** Agent 15 — Admin System Architect  
> **الحالة:** 🟢 معتمد للتنفيذ

---

## 1. نظرة عامة (Overview)

### 1.1 المشكلة

نظام CorePOS حالياً يفتقر لـ:
- **إدارة مستخدمين** على مستوى الشركة — لا يوجد إضافة/تعديل/تعطيل/إعادة كلمة مرور
- **صلاحيات فعّالة** — الكود موجود (PolicyEvaluator) لكن **غير مُستخدم** — أي مستخدم يقدر يعمل أي حاجة
- **سجلات تدقيق** — الصفحة فارغة تماماً ولا يوجد جدول في DB
- **فرض حدود الاشتراك** — كل الحدود `null` (غير محدود) — لا رقابة على الاستخدام
- **بوابة دفع** — الدفع يدوي عبر واتساب فقط

### 1.2 الحل

بناء نظام إداري متكامل على 6 مراحل تحوّل CorePOS من MVP إلى **منتج جاهز للإنتاج** مع:
- CRUD مستخدمين مع tenant isolation
- RBAC مُفعّل فعلياً (Guards + Permissions)
- Audit logs حقيقية
- فرض حدود الاشتراك
- بوابة دفع (حسب القرار)

### 1.3 الجمهور المستهدف

| الدور | ما يحتاجه من هذا النظام |
|-------|--------------------------|
| **مالك الشركة (Owner)** | إضافة موظفين، تعيين أدوار، مراقبة النشاطات، إدارة الاشتراك |
| **مدير فرع (Manager)** | رؤية فريقه، لا يعدّل الصلاحيات |
| **كاشير (Cashier)** | لا يرى إعدادات المستخدمين أصلاً |
| **مشرف المنصة (Platform Admin)** | إدارة كل الشركات والاشتراكات |

---

## 2. الأهداف (Goals)

### 2.1 أهداف رئيسية (Must Have)

| # | الهدف | معيار القبول |
|---|-------|-------------|
| G1 | **CRUD مستخدمين لكل شركة** | Admin يقدر يضيف مستخدم جديد + يعدّل بياناته + يعطّله + يعيد كلمة المرور — كل عملية مقيّدة بالشركة |
| G2 | **RBAC مُفعّل** | Cashier لا يستطيع الوصول لـ `GET /admin/users` — يرجع 403. Admin يقدر. |
| G3 | **Audit Logs حقيقية** | كل عملية CRUD users تظهر في `/dashboard/audit-logs` مع التفاصيل |
| G4 | **فرض حدود الاشتراك** | إذا الشركة وصلت الحد الأقصى للمستخدمين → رسالة خطأ واضحة عند محاولة الإضافة |
| G5 | **حماية Owner** | لا يمكن تعطيل Owner الشركة أو تغيير دوره |
| G6 | **Self-Protection** | لا يمكن للمستخدم تعطيل نفسه |
| G7 | **Tenant Isolation** | لا يمكن لمستخدم شركة A رؤية مستخدمي شركة B |

### 2.2 أهداف ثانوية (Should Have)

| # | الهدف | معيار القبول |
|---|-------|-------------|
| G8 | **Billing API** | صفحة `/billing` تعرض بيانات حقيقية من API |
| G9 | **تنبيه الحدود** | عند اقتراب الشركة من حد المستخدمين/المنتجات → toast في الداشبورد |
| G10 | **Frontend permissions** | أزرار الإدارة مخفية عن الكاشير |
| G11 | **إحصائيات Super Admin** | Revenue stats في overview |

### 2.3 أهداف مؤجلة (Nice to Have / بقرار المالك)

| # | الهدف | ملاحظة |
|---|-------|--------|
| G12 | بوابة دفع (Paymob/Fawry) | ينتظر قرار المالك |
| G13 | Self-service upgrade | ينتظر قرار المالك |
| G14 | إدارة أدوار مخصصة | صفحة `/settings/roles` |
| G15 | تنبيهات email قبل انتهاء الاشتراك | مرحلة لاحقة |

---

## 3. User Stories

### 3.1 إدارة المستخدمين

```
US-01: كمالك شركة، أريد إضافة مستخدم جديد (بريد + كلمة مرور + دور + فرع)
       حتى يقدر يدخل النظام ويشتغل
       معيار القبول: المستخدم الجديد يظهر في الجدول + يقدر يسجّل دخول

US-02: كمالك شركة، أريد تعديل دور مستخدم (من كاشير لمدير)
       حتى أديله صلاحيات أعلى
       معيار القبول: الدور يتغيّر + الصلاحيات تتحدث فوراً

US-03: كمالك شركة، أريد تعطيل مستخدم مؤقتاً مع ذكر السبب
       حتى لا يقدر يدخل النظام
       معيار القبول: المستخدم المعطّل لا يستطيع تسجيل الدخول + يظهر "موقوف" في الجدول

US-04: كمالك شركة، أريد إعادة تعيين كلمة مرور مستخدم نسيها
       حتى يقدر يدخل مرة ثانية
       معيار القبول: النظام يولّد كلمة مؤقتة + تظهر في toast ليقدر الأدمن يرسلها

US-05: كمالك شركة، لا أريد أن أعطّل نفسي بالخطأ
       معيار القبول: زر التعطيل مخفي/معطّل على صف المستخدم الحالي

US-06: كمستخدم عادي (كاشير)، لا يجب أن أرى صفحة المستخدمين أصلاً
       معيار القبول: لا يظهر تاب "المستخدمون" في الـ nav + redirect 403 لو حاول بالرابط
```

### 3.2 الصلاحيات (RBAC)

```
US-07: كنظام، كل endpoint إداري يجب أن يتحقق من الصلاحيات
       معيار القبول: PermissionGuard يعمل على كل endpoints في admin module

US-08: كمالك شركة، أريد أن أعرف أن صلاحياتي آمنة
       معيار القبول: cashier يحصل 403 عند محاولة الوصول لـ /admin/users

US-09: كـ platform_admin، أريد أن أمر من كل الـ guards بدون قيود
       معيار القبول: platform_admin يتجاوز كل checks
```

### 3.3 سجلات التدقيق (Audit)

```
US-10: كمالك شركة، أريد أن أعرف مين عدّل إيه ومتى
       معيار القبول: كل عملية CRUD users تُسجّل في audit-logs مع:
       - اسم المنفّذ
       - نوع العملية
       - التفاصيل (before/after)
       - التاريخ والوقت

US-11: كمالك شركة، أريد عرض سجل النشاطات مع فلترة
       معيار القبول: صفحة /audit-logs تعرض بيانات حقيقية مع فلترة بنوع العملية
```

### 3.4 الاشتراكات

```
US-12: كمالك شركة، أريد أن أعرف كم مستخدم/منتج/فرع استخدمت من الحد
       معيار القبول: صفحة /billing تعرض usage bars بنسب حقيقية

US-13: كنظام، لا أسمح بإضافة مستخدم جديد إذا تجاوز الشركة حد خطتها
       معيار القبول: رسالة خطأ "تجاوزت الحد الأقصى" + كود PLAN_LIMIT_REACHED

US-14: كمالك شركة، أريد تنبيه واضح إذا اقتربت من الحد
       معيار القبول: toast أو badge يظهر "استخدمت 9/10 مستخدمين"
```

---

## 4. القيود التقنية (Technical Constraints)

### 4.1 قيود مُقفلة (من CONTEXT.md)

| # | القيد | التفصيل |
|---|-------|---------|
| C1 | Next.js 15 App Router | لا Pages Router |
| C2 | NestJS + Drizzle ORM | لا Prisma |
| C3 | PostgreSQL | لا MongoDB |
| C4 | Shared DB + company_id | لا DB per tenant |
| C5 | JWT Cookies | لا Bearer tokens |
| C6 | Arabic only + RTL | لا نصوص إنجليزية في الواجهة |
| C7 | Western numerals (1234) | لا أرقام عربية (١٢٣٤) |
| C8 | shadcn/ui + Tailwind v4 | لا Material UI |
| C9 | الدفع يدوي في MVP | D9: لا Paymob في MVP (قابل للمراجعة) |

### 4.2 قيود أمنية

| # | القيد |
|---|-------|
| S1 | كل query يحتوي `WHERE company_id = ?` (Tenant Isolation) |
| S2 | `companyId` من JWT فقط — ليس من body/URL/headers |
| S3 | كل عملية حساسة تتطلب `reason` ويُسجّل في audit |
| S4 | Password hashing بـ bcrypt (cost ≥ 10) |
| S5 | Temp password: 12+ حرف مع letters + numbers + symbols |
| S6 | Rate limiting على login + reset-password (مرحلة لاحقة) |

### 4.3 قيود الأداء

| # | القيد |
|---|-------|
| P1 | `GET /admin/users` يجب أن يرجع في أقل من 500ms لـ 100 مستخدم |
| P2 | `GET /admin/audit-logs` يجب أن يدعم pagination (limit + cursor) |
| P3 | PolicyEvaluator يُخزّن مؤقتاً (cache) لمدة 60 ثانية لتقليل DB queries |

---

## 5. بنية البيانات (Data Model)

### 5.1 الجداول الموجودة (لا تتغير)

```sql
users            (id, email, password_hash, created_at, updated_at)
profiles         (id, user_id, company_id, full_name, role, is_active, phone, ...)
companies        (id, name, ...)
roles            (id, name, company_id, is_system_role, ...)
role_permissions (id, role_id, permission_key, ...)
user_permission_overrides (id, user_id, company_id, permission_key, effect, ...)
```

### 5.2 الجداول الجديدة

```sql
-- المرحلة B
user_roles (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID REFERENCES roles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
)

-- المرحلة C
company_audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_user_id  UUID NOT NULL,
  action         TEXT NOT NULL,        -- 'user.create', 'user.disable', 'settings.update'
  target_type    TEXT,                  -- 'user', 'branch', 'settings', 'subscription'
  target_id      TEXT,
  details        JSONB,                -- { before: {...}, after: {...}, reason: "..." }
  ip             TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
CREATE INDEX idx_company_audit_company_created ON company_audit_logs (company_id, created_at DESC);
CREATE INDEX idx_company_audit_action ON company_audit_logs (action);

-- المرحلة E
payment_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id),
  subscription_id  UUID REFERENCES subscriptions(id),
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT DEFAULT 'EGP',
  status           TEXT DEFAULT 'pending',    -- pending, paid, failed, refunded
  gateway_ref      TEXT,
  gateway_response JSONB,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 6. واجهة المستخدم (UI Spec)

### 6.1 صفحة المستخدمين `/dashboard/settings/users`

```
┌─────────────────────────────────────────────────────────┐
│ 🔹 [SettingsNav: شركة | فروع | مخازن | 👥المستخدمون | ...] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  المستخدمون                        [➕ إضافة مستخدم]    │
│  إدارة مستخدمي الشركة وصلاحياتهم                        │
│                                                         │
│  [🔍 بحث بالاسم أو البريد]  [الدور ▼]  [الحالة ▼]       │
│                                                         │
│  ┌──────┬──────────────┬───────┬──────┬──────┬────────┐ │
│  │ الاسم │ البريد       │ الدور │ الفرع│الحالة│ إجراء  │ │
│  ├──────┼──────────────┼───────┼──────┼──────┼────────┤ │
│  │ أحمد │ ahmed@co.com │ كاشير│ فرع1 │ ✅   │ ⋮ ▼    │ │
│  │ محمد │ mo@co.com    │ مدير │ فرع2 │ ✅   │ ⋮ ▼    │ │
│  │ علي  │ ali@co.com   │ عارض │  —   │ 🔴   │ ⋮ ▼    │ │
│  └──────┴──────────────┴───────┴──────┴──────┴────────┘ │
│                                                         │
│  Badges الأدوار:                                         │
│  🟣 owner  🔵 admin  🟢 manager  🟠 cashier  ⚪ viewer  │
│                                                         │
│  قائمة الإجراءات (⋮):                                    │
│  ├── ✏️ تعديل البيانات                                   │
│  ├── 🔄 تعطيل / تفعيل  → ReasonDialog                   │
│  └── 🔑 إعادة كلمة المرور → ReasonDialog → toast بالكلمة │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Dialog إضافة مستخدم

```
┌────────────────────────────────────────┐
│ إضافة مستخدم جديد                ✕    │
├────────────────────────────────────────┤
│                                        │
│ الاسم الكامل *     [________________]  │
│ البريد الإلكتروني * [________________]  │
│ كلمة المرور *       [________________]  │
│ الدور *             [admin ▼]          │
│ الفرع               [فرع 1 ▼] اختياري │
│ الهاتف              [________________]  │
│                                        │
├────────────────────────────────────────┤
│            [إلغاء]     [➕ إضافة]       │
└────────────────────────────────────────┘
```

### 6.3 Dialog السبب (ReasonDialog)

```
┌────────────────────────────────────────┐
│ سبب العملية                      ✕    │
├────────────────────────────────────────┤
│                                        │
│ يرجى ذكر سبب هذه العملية:              │
│ [________________________________]     │
│ (3 أحرف على الأقل)                     │
│                                        │
├────────────────────────────────────────┤
│            [إلغاء]     [تأكيد]          │
└────────────────────────────────────────┘
```

### 6.4 الحالات الأربع (Loading / Empty / Error / Data)

```
Loading:  "جاري تحميل المستخدمين..." + spinner
Empty:    "لم يتم إضافة مستخدمين بعد" + زر CTA "إضافة أول مستخدم"
Error:    "تعذّر تحميل المستخدمين. تأكد من الاتصال وأعد المحاولة." + زر إعادة
Data:     الجدول الموضّح أعلاه
```

---

## 7. API Contract (ملخص)

```
┌─────────┬──────────────────────────────────┬────────────────────┬──────────┐
│ Method  │ Path                             │ Permission         │ المرحلة  │
├─────────┼──────────────────────────────────┼────────────────────┼──────────┤
│ GET     │ /v1/admin/users                  │ admin.users.read   │ A        │
│ POST    │ /v1/admin/users                  │ admin.users.manage │ A        │
│ PATCH   │ /v1/admin/users/:id              │ admin.users.manage │ A        │
│ POST    │ /v1/admin/users/:id/toggle-active│ admin.users.manage │ A        │
│ POST    │ /v1/admin/users/:id/reset-pwd    │ admin.users.manage │ A        │
│ GET     │ /v1/admin/audit-logs             │ admin.audit.read   │ C        │
│ GET     │ /v1/billing/current              │ (authenticated)    │ D        │
│ GET     │ /v1/billing/usage                │ (authenticated)    │ D        │
│ POST    │ /v1/billing/checkout             │ (authenticated)    │ E        │
│ POST    │ /v1/webhooks/payment             │ (HMAC verified)    │ E        │
└─────────┴──────────────────────────────────┴────────────────────┴──────────┘
```

---

## 8. الجدول الزمني

```
الأسبوع 1 (الأيام 1-3):
  ├── المرحلة A — إدارة المستخدمين (Backend + Frontend)     🔴 أساسي
  ├── المرحلة B — RBAC (Guard + Decorator + PolicyEvaluator) 🔴 أساسي
  └── المرحلة C — Audit Logs                                 🟡 مهم

الأسبوع 2 (الأيام 4-6):
  ├── المرحلة D — تفعيل الاشتراكات + فرض الحدود             🟡 مهم
  └── المرحلة E — بوابة الدفع (بقرار المالك)                 🟡 اختياري

الأسبوع 3 (الأيام 7-9):
  ├── المرحلة F — تحسينات Super Admin                        🟢 تحسين
  └── التوثيق النهائي + اختبار شامل                          🟢 إغلاق
```

---

## 9. معايير القبول النهائية (Definition of Done)

### ✅ يُعتبر النظام مكتملاً عندما:

- [ ] Admin يقدر يضيف مستخدم → يظهر في الجدول → يقدر يسجّل دخول
- [ ] Admin يقدر يعطّل مستخدم → المعطّل لا يقدر يدخل
- [ ] Admin يقدر يعيد كلمة مرور → المستخدم يدخل بالكلمة الجديدة
- [ ] Cashier لا يرى صفحة المستخدمين ولا يقدر يوصلها بالرابط
- [ ] كل عملية CRUD تُسجّل في audit-logs مع التفاصيل
- [ ] صفحة `/billing` تعرض بيانات حقيقية (usage bars)
- [ ] عند تجاوز حد الخطة → رسالة خطأ واضحة
- [ ] لا يمكن تعطيل Owner أو النفس
- [ ] كل الملفات المذكورة في التوثيق محدّثة
- [ ] `npm run backend:build` يمر بدون أخطاء
- [ ] Frontend يعمل بدون console errors في الرحلة الكاملة

---

## 10. المراجع

| الملف | الوصف |
|-------|-------|
| [ADMIN_SYSTEM_MASTER_PLAN.md](./ADMIN_SYSTEM_MASTER_PLAN.md) | خطة التنفيذ التفصيلية (6 مراحل + كود) |
| [USER_MANAGEMENT_MASTER_PLAN.md](./USER_MANAGEMENT_MASTER_PLAN.md) | تفصيل كود المراحل A+B+C |
| [CONTEXT.md](../CONTEXT.md) | سياق المشروع والقرارات المُقفلة |
| [api_contract_v1.md](../api_contract_v1.md) | عقد الـ APIs الرسمي |
| [api_contract_map.md](../api_contract_map.md) | خريطة Frontend ↔ Backend |
| [screens_map.md](../screens_map.md) | خريطة الشاشات |
| [saas_architecture.md](../saas_architecture.md) | معمارية SaaS |
| [Agent 15](../../.agents/agent-15-admin-system.md) | تعليمات الـ Agent المنفّذ |

---

## 11. سجل القرارات

| التاريخ | القرار | المبرر |
|---------|--------|--------|
| 2026-04-27 | `profiles.role` يبقى كـ fallback | التوافق مع الكود الموجود — التحوّل التدريجي لـ `user_roles` |
| 2026-04-27 | `x-company-id` يبقى في dev فقط | تسهيل التطوير — يُزال في production |
| 2026-04-27 | Audit بدون IP في البداية | مرحلة لاحقة — يحتاج X-Forwarded-For handling |
| 2026-05-01 | تنفيذ ADMIN_SYSTEM_MASTER_PLAN (الشاملة) | تغطي كل المحاور — الخطة الأولى تفصيلية لجزء فقط |
| 2026-05-01 | Backend-first في كل مرحلة | DB → Service → Controller → Frontend |
| 2026-05-01 | لا Payment Gateway في MVP | القرار D9 — قابل للمراجعة مع المالك |

---

## 12. المخاطر

| المخاطرة | الاحتمال | التأثير | التخفيف |
|----------|----------|---------|---------|
| كسر Login بعد تعديل middleware | عالي | حرج | اختبار smoke بعد كل تعديل |
| كسر Tenant Isolation | منخفض | حرج | كل query يحتوي company_id + review |
| تعارض migration مع بيئات أخرى | متوسط | متوسط | drizzle-kit push فقط — لا generate في production |
| أداء PolicyEvaluator بطيء | منخفض | متوسط | cache 60 ثانية + index على user_roles |
| بيانات وهمية تبقى في الكود | متوسط | منخفض | مراجعة كل `[]` و `null` stubs |
