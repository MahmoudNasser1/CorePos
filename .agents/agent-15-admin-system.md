# 🛡️ Agent 15 — Admin System Architect (Users + RBAC + Billing + Audit)
**المشروع:** CorePOS | **النطاق:** Full-Stack (Backend: `apps/backend/src/modules/admin` + `common/rbac` + `modules/billing` | Frontend: `src/app/(dashboard)/settings` + `src/app/(billing)`)  
**الدور:** مهندس متخصص في بناء واستكمال النظام الإداري الكامل: إدارة المستخدمين، الصلاحيات، الاشتراكات، سجلات التدقيق، وبوابة الدفع.

---

## 🎯 الهدف الأساسي

بناء نظام إداري **آمن، متكامل، وجاهز للإنتاج** يغطي:
1. **CRUD مستخدمين** لكل شركة مع tenant isolation كامل
2. **RBAC مُفعّل** — PermissionGuard + PolicyEvaluator يعملان فعلياً
3. **Audit Logs** حقيقية على مستوى الشركة
4. **نظام اشتراكات** يفرض الحدود فعلياً
5. **بوابة دفع** (مرحلة لاحقة بقرار من المالك)

---

## ⚡ Quick Facts (حقائق تشغيلية — ارجعلها دائماً)

```
Backend port:     4000
Global prefix:    /v1  (app.setGlobalPrefix('v1') في main.ts)
Admin controller: @Controller('admin')  → المسار الفعلي: /v1/admin/*
ORM:              Drizzle (sql`` template — ليس query builder دائماً)
Hashing:          bcryptjs (cost=10) — import * as bcrypt from 'bcryptjs'
DB null guard:    كل method تبدأ بـ `if (!db) return ...`
Tenant source:    req.companyId + req.userId (من tenant.middleware.ts)
Response format:  { success: true, data } أو throw exception
Admin module:     providers: [AdminService] فقط — يحتاج إضافة PolicyEvaluatorService
```

---

## 📖 اقرأ أولاً (إلزامي — لا تبدأ أي تاسك بدون قراءة هذه الملفات)

### الملفات الأساسية (ابدأ بها بالترتيب)
```
1. docs/CONTEXT.md                                  ← سياق المشروع وقرارات مُقفلة
2. docs/plans/ADMIN_SYSTEM_PRD.md                   ← PRD المهمة (الأهداف + القيود + معايير القبول)
3. docs/plans/ADMIN_SYSTEM_MASTER_PLAN.md           ← خطة التنفيذ (6 مراحل + كود + checklist)
4. docs/plans/USER_MANAGEMENT_MASTER_PLAN.md        ← تفصيل كود المراحل A+B+C
5. docs/api_contract_v1.md                          ← العقد الرسمي للـ APIs
6. docs/api_contract_map.md                         ← ربط Frontend ↔ Backend
```

### ملفات مرجعية (ارجعلها عند الحاجة)
```
7. docs/screens_map.md                              ← خريطة الشاشات
8. docs/saas_architecture.md                        ← معمارية SaaS
9. docs/CODING_STANDARDS.md                         ← معايير الكود
10. docs/agent_reports/OPS_SAFETY_CHARTER.md        ← قواعد الأمان للأفعال الحساسة
11. docs/agent_reports/ERROR_COPY_DICTIONARY.md     ← نصوص الأخطاء العربية الموحّدة
```

---

## 🛠️ Skills المطلوبة (إلزامي)

### Skills أساسية (اقرأها قبل أي تنفيذ)
```text
@backend-dev-guidelines     ← أنماط Backend عامة
@api-design-principles      ← تصميم APIs
@database-design             ← تصميم قواعد بيانات
@postgres-best-practices     ← أفضل ممارسات PostgreSQL
@backend-security-coder      ← أمان Backend
@security-auditor            ← تدقيق أمني
@nextjs-best-practices       ← أنماط Next.js App Router
@react-patterns              ← أنماط React
@concise-planning            ← تخطيط مختصر
```

### Skills حسب المرحلة (اقرأها قبل بدء المرحلة المحددة)

| المرحلة | Skills إضافية | لماذا |
|---------|---------------|-------|
| **A** (Users CRUD) | `@auth-implementation-patterns`, `@api-patterns` | password hashing + API design |
| **B** (RBAC) | `@security-auditor`, `@differential-review` | Guards + permission evaluation |
| **C** (Audit) | `@database-design` | schema design + indexing |
| **D** (Billing) | `@api-patterns`, `@saas-multi-tenant` | subscription + plan limits |
| **E** (Payment) | `@payment-integration`, `@api-security-best-practices` | webhook security + HMAC |
| **F** (Super Admin) | `@react-patterns`, `@ui-review` | dashboard widgets + charts |

---

## ✅ قاعدة إلزامية: Skills-First + PRD-First قبل أي تنفيذ

### قبل كل تاسك:
1. **اقرأ PRD** — `docs/plans/ADMIN_SYSTEM_PRD.md` — تأكد أن التاسك يحقق أهداف محددة
2. **اقرأ Skill** واحد على الأقل مناسب للمهمة
3. **ارجع للـ Master Plan** — `docs/plans/ADMIN_SYSTEM_MASTER_PLAN.md` — القسم المحدد
4. **نفّذ** — بالترتيب المحدد في الخطة

### بعد كل تاسك:
1. ✅ **حدّث Checklist** في `ADMIN_SYSTEM_MASTER_PLAN.md` → غيّر `[ ]` لـ `[x]`
2. 📝 **سجّل ملاحظة** في `docs/agent_reports/PROGRESS.md` عن اللي عملته
3. 🧪 **اختبر** — شغّل الـ smoke test المناسب (curl + متصفح)
4. 📖 **حدّث التوثيق** — `api_contract_v1.md` + `api_contract_map.md` + `screens_map.md` لو فيه إضافات

---

## 🧭 ترتيب التنفيذ (Sequence) — إلزامي

```
╔══════════════════════════════════════════════════════════════╗
║   المرحلة A → المرحلة B → المرحلة C → المرحلة D → E → F     ║
║   (Users)    (RBAC)      (Audit)     (Billing)  (Pay)(SA)   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   A هو الأساس — كل المراحل اللاحقة تعتمد عليه               ║
║   B يعتمد على A (الـ Guard يحمي endpoints المستخدمين)        ║
║   C يعتمد على A (الـ audit يسجّل عمليات المستخدمين)          ║
║   D مستقل لكن يُفضّل بعد A+B+C                               ║
║   E يعتمد على D                                              ║
║   F مستقل لكن يُفضّل بعد D                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### داخل كل مرحلة: Backend → Frontend → توثيق
```
1. Backend Service methods     ← الأعمق أولاً
2. Backend Controller endpoints ← واجهة الـ API
3. Backend DTOs                 ← Validation classes
4. Backend Module update        ← إضافة providers جديدة
5. Backend Migration (لو فيه schema) ← drizzle-kit generate + push
6. Frontend API Adapter         ← ربط بالـ backend
7. Frontend Server Actions      ← طبقة وسيطة
8. Frontend Page + Components   ← الواجهة المرئية
9. Frontend Nav + Middleware     ← الربط في الهيكل
10. توثيق api_contract_v1/map   ← آخر خطوة
```

### ⚠️ بين كل خطوة:
```
✅ Backend build:     cd apps/backend && npx tsc --noEmit
✅ أي تغيير schema:  npx drizzle-kit generate && npx drizzle-kit push
✅ Frontend check:    npm run lint (بعد إضافة page/component)
```

---

## 🧱 هيكل الملفات المتوقع (بعد الاكتمال)

```
apps/backend/src/
├── common/
│   ├── db/schema.ts                          ← + userRoles + companyAuditLogs + paymentInvoices
│   ├── rbac/
│   │   ├── permission-keys.ts                ← 21+ مفتاح (بدل 13)
│   │   ├── policy-evaluator.service.ts       ← + دعم user_roles + fallback
│   │   ├── permission.guard.ts               ← 🆕 PermissionGuard
│   │   └── require-permission.decorator.ts   ← 🆕 @RequirePermission()
│   └── tenant/tenant.middleware.ts           ← + isActive check
├── modules/
│   ├── admin/
│   │   ├── admin.controller.ts               ← + 5 endpoints users + guards
│   │   ├── admin.service.ts                  ← + createUser/updateUser/toggle/reset/audit
│   │   └── admin.module.ts                   ← + PermissionGuard provider
│   └── billing/                              ← 🆕 مجلد كامل
│       ├── billing.controller.ts             ← GET current/usage + POST checkout
│       ├── billing.service.ts                ← getCurrentBilling + getUsageStats
│       ├── billing-webhook.controller.ts     ← POST /webhooks/payment
│       └── billing.module.ts

src/
├── app/(dashboard)/dashboard/settings/
│   └── users/page.tsx                        ← 🆕 صفحة المستخدمين
├── components/settings/
│   ├── SettingsNav.tsx                        ← + تاب المستخدمون
│   └── UsersManagement.tsx                   ← 🆕 Client component
├── hooks/
│   └── use-permissions.ts                    ← 🆕 Permission hook
├── lib/
│   ├── api/admin.ts                          ← + 4 methods CRUD users
│   ├── actions/settings.actions.ts           ← + 5 Server Actions users
│   └── plan-limits.ts                        ← تفعيل فعلي بدل stubs
└── middleware.ts                             ← + role check لـ settings/users
```

---

## 🔐 قواعد أمنية صارمة (لا استثناء)

### 1. Tenant Isolation
```
✅ كل query يحتوي WHERE company_id = companyId
✅ companyId يأتي من JWT — ليس من body أو URL param
✅ لا يمكن لمستخدم شركة A أن يرى/يعدّل بيانات شركة B
```

### 2. Self-Protection Rules
```
✅ لا يمكن للمستخدم تعطيل نفسه
✅ لا يمكن تعطيل Owner الشركة
✅ لا يمكن تغيير role الـ Owner
✅ لا يمكن حذف آخر admin في الشركة
```

### 3. Audit Everything
```
✅ كل عملية CRUD users ← audit log مع reason
✅ كل تغيير settings ← audit log
✅ كل عملية اشتراك ← audit log
✅ الـ audit يحتوي: actorUserId, action, targetType, targetId, details, timestamp
```

### 4. Permission Check
```
✅ كل endpoint إداري يستخدم @UseGuards(PermissionGuard)
✅ كل endpoint يحدد @RequirePermission('admin.users.manage')
✅ platform_admin يمر من كل الـ guards
✅ Frontend يخفي الأزرار حسب الدور (usePermissions hook)
```

---

## 🔌 API Envelope (ملزم)

```typescript
// نجاح — Controller يرجّع الـ data مباشرة، NestJS يلفّها
{ success: true, data: T }

// خطأ — استخدم NestJS exceptions:
throw new BadRequestException({ code: 'ERROR_CODE', message: 'رسالة عربية' })
throw new ForbiddenException({ code: 'FORBIDDEN', message: 'لا تملك الصلاحية' })
throw new NotFoundException({ code: 'NOT_FOUND', message: 'غير موجود' })

// أكواد الخطأ الجديدة:
'MISSING_COMPANY'       // لا يوجد companyId
'USER_NOT_FOUND'        // المستخدم غير موجود في الشركة
'CANNOT_MODIFY_SELF'    // لا يمكن تعطيل/تغيير دور النفس
'CANNOT_MODIFY_OWNER'   // لا يمكن تعديل Owner
'EMAIL_ALREADY_EXISTS'  // البريد مسجل مسبقاً
'PLAN_LIMIT_REACHED'    // تجاوز حد الخطة
'FORBIDDEN'             // لا يملك الصلاحية
'LAST_ADMIN'            // لا يمكن تعطيل آخر admin
```

---

## 🧬 أنماط الكود الحقيقية (اتبعها بالضبط)

### نمط Service Method (من admin.service.ts الحالي):
```typescript
async methodName(companyId: string, ...args) {
  if (!db) return null  // ← DB null guard — إلزامي في كل method
  
  const [row] = await db
    .select()
    .from(profiles)
    .where(sql`${profiles.companyId} = ${companyId}`)  // ← tenant isolation
    .limit(1)
  return row ?? null
}
```

### نمط Controller Endpoint (من admin.controller.ts الحالي):
```typescript
@Get('users')
async listUsers(@Headers('x-company-id') hCompanyId: string, @Headers('x-user-id') hUserId: string) {
  const companyId = hCompanyId  // ← يأتي من tenant middleware عبر headers
  if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY', message: 'missing company' })
  return this.adminService.listUsers(companyId)
}
```

> **ملاحظة مهمة:** Controller الحالي يستخدم `@Headers('x-company-id')` وليس `@Req() req`.
> ارجع للـ controller الفعلي وتأكد من النمط المُستخدم قبل كتابة endpoints جديدة.
> لو فيه `req.companyId` → استخدمه. لو فيه `@Headers()` → استخدمه.
> **لا تخترع نمط جديد مختلف عن الموجود.**

### نمط Password Hashing (من auth.service.ts):
```typescript
import * as bcrypt from 'bcryptjs'
const passwordHash = await bcrypt.hash(password, 10)  // cost = 10
```

### نمط Frontend Adapter (من admin.ts الحالي):
```typescript
import { backendFetch } from './backend-client'
export const adminApi = {
  methodName: (args) => backendFetch<ReturnType>('/admin/path', { method: 'POST', body: payload }),
}
```

> **المسار في backendFetch يبدأ بـ `/admin/...`** (بدون `/v1` — الـ backendFetch يضيفها تلقائياً)

---

## 🧪 Verification بعد كل مرحلة

### المرحلة A (Users CRUD):
```bash
# Backend build
cd apps/backend && npm run build

# Smoke tests
curl -X GET  http://localhost:4000/v1/admin/users -H "Cookie: access_token=..."
curl -X POST http://localhost:4000/v1/admin/users -H "Content-Type: application/json" -d '{"email":"test@co.com","password":"Pass123!","fullName":"تجربة","role":"cashier"}'
curl -X PATCH http://localhost:4000/v1/admin/users/UUID -d '{"reason":"تحديث","role":"manager"}'
curl -X POST http://localhost:4000/v1/admin/users/UUID/toggle-active -d '{"reason":"تعطيل مؤقت"}'

# Frontend
# تأكد من: SettingsNav يظهر تاب "المستخدمون"
# تأكد من: الجدول يعرض البيانات بشكل صحيح
# تأكد من: Dialog الإضافة يعمل
```

### المرحلة B (RBAC):
```bash
# اختبار أن cashier لا يستطيع الوصول لـ admin endpoints
curl -X GET http://localhost:4000/v1/admin/users -H "Cookie: cashier_token=..."
# المتوقع: 403 Forbidden

# اختبار أن admin يستطيع
curl -X GET http://localhost:4000/v1/admin/users -H "Cookie: admin_token=..."
# المتوقع: 200 + data
```

### المرحلة C (Audit):
```bash
# بعد إضافة مستخدم:
curl -X GET http://localhost:4000/v1/admin/audit-logs
# المتوقع: يحتوي { action: 'user.create', ... }
```

---

## 🤝 Frontend ↔ Backend Protocol

### هذا Agent يعمل Full-Stack:
1. **ابدأ Backend أولاً** — schema → service → controller → migration
2. **ثم Frontend** — adapter → actions → page → components → nav
3. **ثم التوثيق** — api_contract_v1 → api_contract_map → screens_map

### لو احتجت دعم من Agent آخر:
- اكتب Handoff في `docs/agent_reports/HANDOFFS.md`
- استخدم قالب: `docs/agent_reports/HANDOFF_TEMPLATE.md`

---

## 🚫 Anti-Patterns (ممنوعات صارمة)

```
❌ لا تستخدم x-company-id في production — JWT فقط
❌ لا تعيد بيانات وهمية أو stubs ترجّع أرقام غير حقيقية
❌ لا تنشئ endpoint بدون @RequirePermission (بعد المرحلة B)
❌ لا تعدّل بيانات مستخدم بدون كتابة audit log (بعد المرحلة C)
❌ لا تعدّل schema.ts بدون drizzle-kit generate + push
❌ لا تستخدم window.confirm — استخدم AlertDialog من shadcn
❌ لا تعرض نصوص إنجليزية في الواجهة — عربي فقط
❌ لا تستخدم left/right — استخدم start/end (RTL)
❌ لا تنفّذ مرحلة قبل إتمام المرحلة السابقة
❌ لا تنسى `if (!db) return ...` في أول سطر من أي Service method
❌ لا تستخدم Prisma syntax — هذا مشروع Drizzle فقط
❌ لا تنسى `@Injectable()` على أي Service class جديد
❌ لا تنسى إضافة أي Service جديد لـ providers في admin.module.ts
```

---

## ⚠️ Gotchas (أخطاء شائعة يجب تجنبها)

```
1. AdminModule حالياً يحتوي `providers: [AdminService]` فقط
   → عند إضافة PermissionGuard + PolicyEvaluatorService لازم تضيفهم للـ providers

2. PolicyEvaluatorService.getEffectivePermissions() حالياً يرجّع Set<string>
   → الـ Guard لازم يتعامل مع Set (مش Array) أو تحوّل الـ return type

3. Controller الحالي يستخدم @Headers('x-company-id') في بعض الأماكن
   → تأكد من النمط المُستخدم فعلياً قبل كتابة endpoints جديدة
   → لو فيه خلط، وحّد على نمط واحد (الأفضل: req.companyId من middleware)

4. auth.service.ts يستخدم `bcryptjs` (وليس `bcrypt`)
   → استخدم نفس المكتبة: import * as bcrypt from 'bcryptjs'

5. profiles.role هو نص حر ('admin', 'cashier', etc.) وليس UUID
   → لا تحاول ربطه بجدول roles كـ FK — استخدم user_roles الجديد

6. backendFetch في الفرونت يضيف /v1 تلقائياً
   → اكتب '/admin/users' وليس '/v1/admin/users'

7. SettingsNav حالياً فيه 6 تابات — المستخدمون يضاف بعد "المخازن"
   → تأكد من الترتيب الصحيح في المصفوفة
```

---

## 🔀 Decision Tree (عند الشك — ارجع لهذا)

```
سؤال: هل أنشئ ملف جديد أم أعدّل الموجود؟
├── لو الوظيفة جديدة تماماً (مثل PermissionGuard) → ملف جديد
├── لو إضافة method في service موجود → تعديل الملف
└── لو تعديل schema → تعديل schema.ts + migration جديدة

سؤال: هل أستخدم sql`` أم query builder؟
├── لو الكود الموجود حولك يستخدم sql`` → استخدم sql``
└── لو الكود يستخدم .select().from().where(eq()) → استخدم query builder
→ ملاحظة: admin.service.ts يستخدم sql`` template literals

سؤال: هل أضيف validation في Service أم Controller؟
├── Input validation (format/type) → DTO في Controller (class-validator)
└── Business validation (مثل: لا تعطّل نفسك) → Service

سؤال: Frontend — Server Component أم Client Component؟
├── الصفحة الرئيسية (page.tsx) → Server Component (data fetching)
└── الجدول التفاعلي + Dialogs → Client Component منفصل
```

---

## 🔄 Error Recovery (لو حصل خطأ)

```
خطأ: Build failed بعد تعديل schema.ts
→ تأكد من imports (اسم الجدول + اسم العلاقة)
→ تأكد من إن أي جدول مُشار إليه معرّف قبله
→ شغّل: cd apps/backend && npx tsc --noEmit 2>&1 | head -20

خطأ: Migration failed
→ شغّل: npx drizzle-kit push --force
→ لو فشل: تأكد من DATABASE_URL في .env

خطأ: Endpoint يرجّع 500
→ تأكد من: if (!db) return
→ تأكد من: الـ Service مضاف في providers
→ تأكد من: الـ imports صحيحة

خطأ: Frontend page blank
→ console.log الـ response من الـ API
→ تأكد إن الـ backend شغال على port 4000
→ تأكد من الـ cookies (access_token)

خطأ: Login كسر بعد تعديل middleware
→ ارجع للتعديل فوراً
→ لا تعدّل middleware + service + controller في نفس الوقت
→ عدّل واحد واختبر قبل ما تكمل
```

---

## ✅ Deliverables المتوقعة

بعد اكتمال كل المراحل، يجب أن يكون:

| المحور | الحالة المتوقعة |
|--------|-----------------|
| إدارة المستخدمين | CRUD كامل + UI + حماية tenant |
| RBAC | Guard مُفعّل على كل endpoints إداري |
| Audit Logs | بيانات حقيقية من كل عملية CRUD |
| الاشتراكات | فرض حدود حقيقية (users/products/branches) |
| بوابة الدفع | (حسب قرار المالك) |
| التوثيق | كل الملفات محدّثة ومتوافقة |
