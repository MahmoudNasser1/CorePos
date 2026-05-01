# 🔐 خطة إدارة المستخدمين والصلاحيات — خطة التنفيذ الرئيسية

> **الإصدار:** 1.0 | **التاريخ:** 27 أبريل 2026  
> **الحالة:** 🔴 في انتظار الموافقة والتنفيذ  
> **المرجع:** `docs/plans/system_rbac_ops_plan.md` + `docs/api_contract_v1.md`

---

## 📑 فهرس المحتويات

1. [تحليل الوضع الحالي](#1-تحليل-الوضع-الحالي)
2. [الفجوات والنواقص](#2-الفجوات-والنواقص)
3. [المرحلة 1 — Backend APIs لإدارة المستخدمين](#3-المرحلة-1--backend-apis-لإدارة-مستخدمي-الشركة)
4. [المرحلة 2 — صفحة الفرونت إند لإدارة المستخدمين](#4-المرحلة-2--صفحة-الفرونت-إند-لإدارة-المستخدمين)
5. [المرحلة 3 — نظام الأدوار والصلاحيات RBAC](#5-المرحلة-3--نظام-الأدوار-والصلاحيات-rbac)
6. [المرحلة 4 — تحسين داشبورد الأدمن + Audit Logs](#6-المرحلة-4--تحسين-داشبورد-الأدمن--audit-logs)
7. [المرحلة 5 — تحسينات أمنية وتشغيلية](#7-المرحلة-5--تحسينات-أمنية-وتشغيلية)
8. [خريطة الملفات (File Map)](#8-خريطة-الملفات-file-map)
9. [API Contract الجديد](#9-api-contract-الجديد)
10. [خطة التحقق والاختبار](#10-خطة-التحقق-والاختبار)
11. [Checklist التنفيذ](#11-checklist-التنفيذ)

---

## 1. تحليل الوضع الحالي

### 1.1 ملخص المعمارية

```
┌──────────────────────────────────────────────────────────┐
│                     Next.js 15 (Frontend)                │
│  src/app/(dashboard)/dashboard/settings/                 │
│  src/app/(super-admin)/super-admin/                      │
│  src/lib/api/admin.ts  ←→  src/lib/api/platform-admin.ts│
│                    ↓ backendFetch ↓                       │
├──────────────────────────────────────────────────────────┤
│                     NestJS (Backend)                      │
│  modules/admin/         → Company-level admin            │
│  modules/platform-admin/ → Platform-level admin          │
│  common/rbac/           → PolicyEvaluator + PermKeys     │
│  common/tenant/         → Tenant Middleware (JWT)        │
│                    ↓ Drizzle ORM ↓                        │
├──────────────────────────────────────────────────────────┤
│                    PostgreSQL                             │
│  users, profiles, roles, role_permissions,               │
│  user_permission_overrides, org_units,                   │
│  platform_audit_logs                                     │
└──────────────────────────────────────────────────────────┘
```

### 1.2 حالة كل مكوّن

| المكوّن | الملف | الحالة | التفاصيل |
|---------|-------|--------|----------|
| **Auth** | `modules/auth/` | ✅ مكتمل | register, login, logout, session, refresh |
| **Tenant Isolation** | `common/tenant/tenant.middleware.ts` | ✅ مكتمل | يستخرج companyId + userId من JWT |
| **Platform Admin Guard** | `modules/platform-admin/platform-admin.guard.ts` | ✅ مكتمل | يتحقق من `role === 'platform_admin'` |
| **Admin — listUsers** | `modules/admin/admin.service.ts` | ⚠️ قراءة فقط | `GET /admin/users` → يرجّع مستخدمي الشركة |
| **Admin — CRUD Users** | ❌ غير موجود | ❌ ناقص | لا يوجد create/update/delete/reset-password |
| **Admin — Roles** | ❌ غير موجود | ❌ ناقص | لا يوجد CRUD للأدوار على مستوى الشركة |
| **Permission Keys** | `common/rbac/permission-keys.ts` | ✅ جزئي | 13 مفتاح معرّف |
| **Policy Evaluator** | `common/rbac/policy-evaluator.service.ts` | ⚠️ غير مُفعّل | موجود لكن لا يُستخدم في أي Guard |
| **DB Schema (RBAC)** | `common/db/schema.ts` | ✅ جداول موجودة | roles, role_permissions, user_permission_overrides |
| **Frontend Settings** | `src/components/settings/SettingsNav.tsx` | ⚠️ جزئي | 6 تابات، لا يوجد "المستخدمون" |
| **Frontend Dashboard** | `src/app/(dashboard)/dashboard/page.tsx` | ✅ مكتمل | KPIs + Charts (بدون widget فريق) |
| **Super Admin** | `src/app/(super-admin)/` | ✅ مكتمل | overview, companies, users, rbac, org, audit |

### 1.3 مسارات الملفات الحالية (Backend)

```
apps/backend/src/
├── common/
│   ├── db/schema.ts                    ← تعريف كل الجداول (765 سطر)
│   ├── rbac/
│   │   ├── permission-keys.ts          ← PERMISSION_KEYS enum (13 key)
│   │   └── policy-evaluator.service.ts ← getEffectivePermissions()
│   └── tenant/
│       ├── tenant.middleware.ts         ← استخراج companyId/userId
│       └── require-user-id.ts          ← helper
├── modules/
│   ├── admin/
│   │   ├── admin.controller.ts         ← GET branches/warehouses/users/company + POST/PATCH
│   │   ├── admin.service.ts            ← Business logic
│   │   └── admin.module.ts
│   ├── platform-admin/
│   │   ├── platform-admin.controller.ts ← overview/companies/users/rbac/audit/org
│   │   ├── platform-admin.service.ts    ← Platform-wide logic (739 سطر)
│   │   ├── platform-admin.guard.ts      ← role === platform_admin check
│   │   └── platform-admin.module.ts
│   └── auth/
│       ├── auth.controller.ts
│       └── auth.service.ts
```

### 1.4 مسارات الملفات الحالية (Frontend)

```
src/
├── app/
│   ├── (dashboard)/dashboard/
│   │   ├── page.tsx                     ← الداشبورد الرئيسي
│   │   ├── settings/
│   │   │   ├── page.tsx                 ← redirect → /settings/company
│   │   │   ├── layout.tsx               ← SettingsNav wrapper
│   │   │   ├── company/page.tsx
│   │   │   ├── branches/page.tsx
│   │   │   ├── warehouses/page.tsx
│   │   │   ├── variables/page.tsx
│   │   │   ├── invoice/page.tsx
│   │   │   └── printing/page.tsx
│   │   │   └── ❌ users/ ← غير موجود!
│   │   └── audit-logs/page.tsx          ← موجود لكن بيانات فارغة
│   └── (super-admin)/super-admin/
│       ├── page.tsx                     ← overview
│       ├── companies/
│       ├── users/                       ← ✅ مكتمل مع actions
│       ├── rbac/                        ← ✅ مكتمل مع client component
│       ├── org/
│       └── audit-logs/
├── components/
│   ├── settings/SettingsNav.tsx          ← 6 تابات (بدون users)
│   └── layout/dashboard-nav-items.ts    ← القوائم الجانبية
├── lib/
│   ├── api/
│   │   ├── admin.ts                     ← adminApi (branches, warehouses, company, listUsers)
│   │   ├── platform-admin.ts            ← platformAdminApi (كامل)
│   │   └── backend-client.ts            ← backendFetch helper
│   └── actions/
│       ├── settings.actions.ts          ← يحتوي getAuditLogs
│       └── platform-admin.actions.ts    ← Server Actions للـ super-admin
```

---

## 2. الفجوات والنواقص

### 🔴 فجوة حرجة #1: لا يوجد CRUD للمستخدمين على مستوى الشركة

**Backend:**
- `GET /admin/users` ← موجود (قراءة فقط)
- `POST /admin/users` ← ❌ غير موجود
- `PATCH /admin/users/:id` ← ❌ غير موجود
- `DELETE /admin/users/:id` ← ❌ غير موجود
- `POST /admin/users/:id/reset-password` ← ❌ غير موجود

**Frontend:**
- لا توجد صفحة `/dashboard/settings/users`
- لا يوجد تاب "المستخدمون" في `SettingsNav.tsx`
- لا يوجد رابط في `dashboard-nav-items.ts`
- `adminApi` (في `src/lib/api/admin.ts`) يحتوي `listUsers` فقط

### 🔴 فجوة حرجة #2: الدور (profiles.role) نص حر وليس مرتبط بجدول roles

**الحالة الآن:**
```
profiles.role = 'admin' | 'manager' | 'cashier' | 'viewer' | 'owner' | 'platform_admin'
            ↑ نص حر في العمود — لا علاقة بجدول roles
```

**المطلوب:**
```
profiles.role ← يبقى كـ fallback/display
user_roles (user_id, role_id) ← الربط الفعلي بجدول roles
policy_evaluator ← يقرأ من user_roles → role_permissions + user_permission_overrides
```

### 🟡 فجوة متوسطة #3: PolicyEvaluator غير مُفعّل

- `PolicyEvaluatorService.getEffectivePermissions()` موجود لكن **لا يُستدعى** من أي Controller أو Guard
- لا يوجد `@RequirePermission()` decorator
- لا يوجد `PermissionGuard` في أي module

### 🟡 فجوة متوسطة #4: Audit Logs غير متصلة على مستوى الشركة

- `/dashboard/audit-logs` ← صفحة موجودة تستدعي `getAuditLogs({ limit: 100 })` لكنها ترجّع `[]`
- لا يوجد جدول `company_audit_logs` — فقط `platform_audit_logs` للـ super-admin

### 🟢 ملاحظة: إدارة المنصة (Super Admin) مكتملة تقريباً

تحتوي على: overview, companies (CRUD), users (enable/disable/reset-password/org-unit), RBAC snapshot/patch, org-units, audit-logs

---

## 3. المرحلة 1 — Backend APIs لإدارة مستخدمي الشركة

> **الأولوية:** 🔴 عالية جداً  
> **المدة التقديرية:** 3-4 ساعات  
> **المتطلبات المسبقة:** لا يوجد

### 3.1 الملفات المطلوب تعديلها

#### `apps/backend/src/modules/admin/admin.service.ts` — [تعديل]

إضافة الدوال التالية:

```typescript
// ──── إنشاء مستخدم جديد ────
async createUser(companyId: string, actorUserId: string, data: {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'manager' | 'cashier' | 'viewer'
  branchId?: string
  phone?: string
}): Promise<{ id: string; email: string; fullName: string; role: string }>

// ──── تحديث بيانات المستخدم ────
async updateUser(companyId: string, actorUserId: string, userId: string, patch: {
  fullName?: string
  role?: string
  branchId?: string | null
  phone?: string
  isActive?: boolean
}, reason: string): Promise<{ updated: true }>

// ──── تعطيل / تفعيل المستخدم (Soft) ────
async toggleUserActive(companyId: string, actorUserId: string, userId: string, reason: string): Promise<{ isActive: boolean }>

// ──── إعادة تعيين كلمة المرور ────
async resetUserPassword(companyId: string, actorUserId: string, userId: string, reason: string): Promise<{ tempPassword: string }>

// ──── تحسين listUsers — إضافة اسم الفرع + count ────
async listUsers(companyId: string): Promise<Array<{
  id: string
  email: string
  fullName: string
  role: string
  branchId: string | null
  branchName: string | null
  phone: string | null
  isActive: boolean
  createdAt: string | null
  lastLoginAt: string | null
}>>
```

**قواعد مهمة:**
1. **Tenant Isolation** — كل query يحتوي `WHERE company_id = companyId`
2. **منع حذف النفس** — لا يسمح للمستخدم بتعطيل نفسه
3. **حماية Owner** — لا يمكن تعطيل الـ owner (أول مستخدم في الشركة)
4. **Audit Log** — كل عملية تكتب سجل في `company_audit_logs` (أو `platform_audit_logs` مع tag)

#### `apps/backend/src/modules/admin/admin.controller.ts` — [تعديل]

إضافة Endpoints:

```typescript
// POST /admin/users — إنشاء مستخدم جديد
@Post('users')
async createUser(@Req() req, @Body() body: CreateUserDto)

// GET /admin/users — عرض كل المستخدمين (محسّن)
@Get('users')
async listUsers(@Req() req)

// PATCH /admin/users/:id — تعديل بيانات المستخدم
@Patch('users/:id')
async updateUser(@Req() req, @Param('id') id: string, @Body() body: UpdateUserDto)

// DELETE /admin/users/:id — تعطيل المستخدم (soft delete)
@Delete('users/:id')
async disableUser(@Req() req, @Param('id') id: string, @Body() body: ReasonDto)

// POST /admin/users/:id/toggle-active — تبديل الحالة
@Post('users/:id/toggle-active')
async toggleActive(@Req() req, @Param('id') id: string, @Body() body: ReasonDto)

// POST /admin/users/:id/reset-password — إعادة تعيين كلمة المرور
@Post('users/:id/reset-password')
async resetPassword(@Req() req, @Param('id') id: string, @Body() body: ReasonDto)
```

#### DTOs الجديدة (داخل admin module أو common):

```typescript
// CreateUserDto
class CreateUserDto {
  @IsEmail() email: string
  @MinLength(6) password: string
  @IsNotEmpty() fullName: string
  @IsIn(['admin', 'manager', 'cashier', 'viewer']) role: string
  @IsOptional() @IsUUID() branchId?: string
  @IsOptional() phone?: string
}

// UpdateUserDto
class UpdateUserDto {
  @IsNotEmpty() reason: string   // سبب التعديل (للـ audit)
  @IsOptional() fullName?: string
  @IsOptional() @IsIn(['admin', 'manager', 'cashier', 'viewer']) role?: string
  @IsOptional() @IsUUID() branchId?: string | null
  @IsOptional() phone?: string
  @IsOptional() @IsBoolean() isActive?: boolean
}

// ReasonDto
class ReasonDto {
  @IsNotEmpty() @MinLength(3) reason: string
}
```

### 3.2 Frontend API Adapter

#### `src/lib/api/admin.ts` — [تعديل]

```typescript
// ──── الإضافات المطلوبة في adminApi ────

export type AdminUser = {
  id: string
  email: string
  fullName: string
  role: string
  branchId: string | null
  branchName: string | null
  phone: string | null
  isActive: boolean
  createdAt: string | null
  lastLoginAt: string | null
}

export const adminApi = {
  // ... الموجود حالياً ...

  // ──── Users CRUD ────
  listUsers: () => backendFetch<AdminUser[]>('/admin/users'),

  createUser: (payload: {
    email: string
    password: string
    fullName: string
    role: string
    branchId?: string
    phone?: string
  }) => backendFetch<AdminUser>('/admin/users', { method: 'POST', body: payload }),

  updateUser: (id: string, payload: {
    reason: string
    fullName?: string
    role?: string
    branchId?: string | null
    phone?: string
    isActive?: boolean
  }) => backendFetch<{ updated: true }>(`/admin/users/${id}`, { method: 'PATCH', body: payload }),

  toggleUserActive: (id: string, payload: { reason: string }) =>
    backendFetch<{ isActive: boolean }>(`/admin/users/${id}/toggle-active`, { method: 'POST', body: payload }),

  resetUserPassword: (id: string, payload: { reason: string }) =>
    backendFetch<{ tempPassword: string }>(`/admin/users/${id}/reset-password`, { method: 'POST', body: payload }),
}
```

#### `src/lib/actions/settings.actions.ts` — [تعديل]

```typescript
// ──── Server Actions للمستخدمين ────
'use server'

export async function listCompanyUsers() {
  return adminApi.listUsers()
}

export async function createCompanyUser(data: Parameters<typeof adminApi.createUser>[0]) {
  return adminApi.createUser(data)
}

export async function updateCompanyUser(id: string, data: Parameters<typeof adminApi.updateUser>[1]) {
  revalidatePath('/dashboard/settings/users')
  return adminApi.updateUser(id, data)
}

export async function toggleCompanyUserActive(id: string, reason: string) {
  revalidatePath('/dashboard/settings/users')
  return adminApi.toggleUserActive(id, { reason })
}

export async function resetCompanyUserPassword(id: string, reason: string) {
  return adminApi.resetUserPassword(id, { reason })
}
```

---

## 4. المرحلة 2 — صفحة الفرونت إند لإدارة المستخدمين

> **الأولوية:** 🔴 عالية جداً  
> **المدة التقديرية:** 4-5 ساعات  
> **المتطلبات المسبقة:** المرحلة 1

### 4.1 الملفات الجديدة

#### `src/app/(dashboard)/dashboard/settings/users/page.tsx` — [جديد]

```
صفحة Server Component تحتوي:
─────────────────────────────────────────────
│ المستخدمون                  [+ إضافة مستخدم] │
│ إدارة مستخدمي الشركة وصلاحياتهم              │
├─────────────────────────────────────────────┤
│ [بحث...] [الدور ▼] [الحالة ▼]                │
├──────┬────────┬───────┬──────┬──────┬───────┤
│ الاسم │ البريد │ الدور │ الفرع │الحالة│ إجراء │
├──────┼────────┼───────┼──────┼──────┼───────┤
│ أحمد │ a@..   │ كاشير│ فرع1 │ ✅   │ ⋮ ▼   │
│ محمد │ m@..   │ مدير │ فرع2 │ ✅   │ ⋮ ▼   │
│ علي  │ x@..   │ عارض │  —   │ 🔴   │ ⋮ ▼   │
└──────┴────────┴───────┴──────┴──────┴───────┘
```

**المكونات المطلوبة:**
1. استدعاء `listCompanyUsers()` من Server Action
2. تمرير البيانات لـ `UsersManagementClient`
3. دعم DataTable مع فلترة وبحث

#### `src/components/settings/UsersManagement.tsx` — [جديد]

Client Component يحتوي:

**1. جدول المستخدمين:**
- الاسم + البريد
- الدور (Badge ملوّن: owner=بنفسجي, admin=أزرق, manager=أخضر, cashier=برتقالي, viewer=رمادي)
- الفرع المُعيّن
- الحالة (نشط/موقوف)
- أزرار الإجراءات

**2. Dialog إضافة/تعديل مستخدم (`UserFormDialog`):**
```
┌─────────────────────────────────────┐
│ إضافة مستخدم جديد                  │
├─────────────────────────────────────┤
│ الاسم الكامل: [________________]    │
│ البريد الإلكتروني: [___________]    │
│ كلمة المرور: [________________]     │
│ الدور:       [admin ▼]              │
│ الفرع:       [فرع 1 ▼] (اختياري)   │
│ الهاتف:      [________________]     │
├─────────────────────────────────────┤
│        [إلغاء]     [إضافة]          │
└─────────────────────────────────────┘
```

**3. أزرار الإجراءات (UserRowActions):**
- ✏️ تعديل → يفتح UserFormDialog بوضع التعديل
- 🔄 تعطيل/تفعيل → يفتح ReasonDialog ثم يستدعي toggleActive
- 🔑 إعادة كلمة المرور → يفتح ReasonDialog ثم يعرض الكلمة المؤقتة في toast

### 4.2 الملفات المطلوب تعديلها

#### `src/components/settings/SettingsNav.tsx` — [تعديل]

```diff
 import { Building2, Globe2, Package2, Receipt, SlidersHorizontal, Printer } from "lucide-react"
+import { Users } from "lucide-react"

 const items = [
   { title: "الشركة والمنطقة", href: "/dashboard/settings/company", icon: Globe2 },
   { title: "الفروع", href: "/dashboard/settings/branches", icon: Building2 },
   { title: "المخازن", href: "/dashboard/settings/warehouses", icon: Package2 },
+  { title: "المستخدمون", href: "/dashboard/settings/users", icon: Users },
   { title: "المتغيرات", href: "/dashboard/settings/variables", icon: SlidersHorizontal },
   { title: "الفاتورة والشركة", href: "/dashboard/settings/invoice", icon: Receipt },
   { title: "الطباعة والقوالب", href: "/dashboard/settings/printing", icon: Printer },
 ] as const
```

#### `src/components/layout/dashboard-nav-items.ts` — [تعديل]

```diff
   {
     title: "النظام",
     items: [
+      { icon: Users, label: "المستخدمون", href: "/dashboard/settings/users" },
       { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs" },
       { icon: CreditCard, label: "الاشتراكات", href: "/billing" },
       { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
       { icon: LifeBuoy, label: "مركز المساعدة", href: "/dashboard/help" },
     ],
   },
```

**ملاحظة:** يجب إضافة `Users` للـ import من `lucide-react`.

---

## 5. المرحلة 3 — نظام الأدوار والصلاحيات RBAC

> **الأولوية:** 🟡 متوسطة-عالية  
> **المدة التقديرية:** 3-4 ساعات  
> **المتطلبات المسبقة:** المرحلة 1 + 2

### 5.1 تعديل Schema (قاعدة البيانات)

#### `apps/backend/src/common/db/schema.ts` — [تعديل]

```typescript
// ──── جدول ربط المستخدم بالدور (جديد) ────
export const userRoles = pgTable('user_roles', {
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId:    uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
  companyIdx: index('user_roles_company_idx').on(t.companyId),
}))

// ──── Relations ────
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users,   { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles,   { fields: [userRoles.roleId], references: [roles.id] }),
  company: one(companies, { fields: [userRoles.companyId], references: [companies.id] }),
}))
```

### 5.2 تحديث PolicyEvaluator

#### `apps/backend/src/common/rbac/policy-evaluator.service.ts` — [تعديل]

```typescript
// ──── الدالة المحدّثة ────
async getEffectivePermissions(userId: string, companyId: string): Promise<string[]> {
  // 1. جلب أدوار المستخدم من user_roles
  const userRoleAssignments = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.companyId, companyId)
    ))

  // 2. Fallback لـ profiles.role إذا لم يكن في user_roles
  if (userRoleAssignments.length === 0) {
    const profile = await db.select({ role: profiles.role })
      .from(profiles)
      .where(and(eq(profiles.userId, userId), eq(profiles.companyId, companyId)))
      .limit(1)

    if (profile.length > 0) {
      // البحث عن Role بهذا الاسم
      const roleByName = await db.select({ id: roles.id })
        .from(roles)
        .where(and(eq(roles.companyId, companyId), eq(roles.name, profile[0].role)))
        .limit(1)

      if (roleByName.length > 0) {
        userRoleAssignments.push({ roleId: roleByName[0].id })
      }
    }
  }

  // 3. جلب صلاحيات الأدوار
  const roleIds = userRoleAssignments.map(r => r.roleId)
  const permsFromRoles = roleIds.length > 0
    ? await db.select({ permissionKey: rolePermissions.permissionKey })
        .from(rolePermissions)
        .where(inArray(rolePermissions.roleId, roleIds))
    : []

  // 4. جلب User overrides
  const overrides = await db.select()
    .from(userPermissionOverrides)
    .where(and(
      eq(userPermissionOverrides.userId, userId),
      eq(userPermissionOverrides.companyId, companyId)
    ))

  // 5. دمج: role perms + grants - denies
  const basePerms = new Set(permsFromRoles.map(p => p.permissionKey))
  for (const o of overrides) {
    if (o.effect === 'allow') basePerms.add(o.permissionKey)
    if (o.effect === 'deny') basePerms.delete(o.permissionKey)
  }

  return Array.from(basePerms)
}
```

### 5.3 Permission Guard + Decorator (جديد)

#### `apps/backend/src/common/rbac/require-permission.decorator.ts` — [جديد]

```typescript
import { SetMetadata } from '@nestjs/common'

export const REQUIRED_PERMISSION_KEY = 'required_permission'
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permissions)
```

#### `apps/backend/src/common/rbac/permission.guard.ts` — [جديد]

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyEvaluator: PolicyEvaluatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!requiredPerms || requiredPerms.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const userId = request.userId
    const companyId = request.companyId

    if (!userId || !companyId) return false

    // platform_admin يمر دائماً
    if (request.userRole === 'platform_admin') return true

    const effective = await this.policyEvaluator.getEffectivePermissions(userId, companyId)
    return requiredPerms.every(p => effective.includes(p))
  }
}
```

### 5.4 تحسين Permission Keys

#### `apps/backend/src/common/rbac/permission-keys.ts` — [تعديل]

```typescript
export const PERMISSION_KEYS = [
  // ──── المخزون ────
  'inventory.read',
  'inventory.write',

  // ──── المبيعات ────
  'sales.read',
  'sales.write',
  'sales.void',            // ← جديد: إلغاء فواتير
  'sales.discount',        // ← جديد: تطبيق خصومات

  // ──── المشتريات ────
  'purchases.read',
  'purchases.write',

  // ──── المالية ────
  'finance.read',
  'finance.write',

  // ──── التقارير ────
  'reports.read',
  'reports.view_costs',

  // ──── جهات الاتصال ────
  'contacts.read',         // ← جديد
  'contacts.write',        // ← جديد

  // ──── الإدارة ────
  'admin.users.read',      // ← جديد: عرض المستخدمين
  'admin.users.manage',
  'admin.roles.manage',    // ← جديد: إدارة الأدوار
  'admin.settings.manage',
  'admin.audit.read',      // ← جديد: عرض سجل النشاطات

  // ──── المنصة ────
  'platform.companies.manage',
  'platform.users.manage',
  'platform.ops.execute',
] as const

export type PermissionKey = typeof PERMISSION_KEYS[number]
```

### 5.5 تطبيق PermissionGuard على Endpoints

#### `apps/backend/src/modules/admin/admin.controller.ts` — [تعديل]

```typescript
// مثال على التطبيق:
@Post('users')
@UseGuards(PermissionGuard)
@RequirePermission('admin.users.manage')
async createUser(@Req() req, @Body() body: CreateUserDto) { ... }

@Get('users')
@UseGuards(PermissionGuard)
@RequirePermission('admin.users.read')
async listUsers(@Req() req) { ... }

@Patch('users/:id')
@UseGuards(PermissionGuard)
@RequirePermission('admin.users.manage')
async updateUser(@Req() req, @Param('id') id: string, @Body() body: UpdateUserDto) { ... }
```

### 5.6 Frontend — إدارة الأدوار (اختياري)

#### `src/app/(dashboard)/dashboard/settings/roles/page.tsx` — [جديد - اختياري]

صفحة لإدارة أدوار الشركة:
- عرض الأدوار الحالية (owner, admin, manager, cashier, viewer)
- تعديل صلاحيات كل دور (checklist)
- إنشاء دور مخصص (مرتبط بالخطط المدفوعة لاحقاً)

---

## 6. المرحلة 4 — تحسين داشبورد الأدمن + Audit Logs

> **الأولوية:** 🟡 متوسطة  
> **المدة التقديرية:** 2-3 ساعات  
> **المتطلبات المسبقة:** المرحلة 1

### 6.1 Widget "الفريق" في الداشبورد

#### `src/components/dashboard/TeamWidget.tsx` — [جديد]

```
┌─────────────────────────────────┐
│ 👥 الفريق                       │
├─────────────────────────────────┤
│ المستخدمين النشطين: 5 / 7       │
│ الأدوار: 2 مدير, 3 كاشير       │
│ آخر إضافة: أحمد (17 أبريل)      │
│                                  │
│ [إدارة المستخدمين →]             │
└─────────────────────────────────┘
```

#### `src/app/(dashboard)/dashboard/page.tsx` — [تعديل]

إضافة `TeamWidget` بعد `StockAlertsWidget` أو في الصف الجانبي.

### 6.2 Audit Logs على مستوى الشركة

#### `apps/backend/src/common/db/schema.ts` — [تعديل]

```typescript
// ──── جدول company_audit_logs (جديد) ────
export const companyAuditLogs = pgTable('company_audit_logs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  actorUserId: uuid('actor_user_id').notNull(),
  action:      varchar('action', { length: 100 }).notNull(),
  targetType:  varchar('target_type', { length: 50 }),
  targetId:    varchar('target_id', { length: 100 }),
  details:     jsonb('details'),
  ip:          varchar('ip', { length: 45 }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  companyCreatedIdx: index('company_audit_logs_company_created_idx').on(t.companyId, t.createdAt),
  actionIdx: index('company_audit_logs_action_idx').on(t.action),
}))
```

#### `apps/backend/src/modules/admin/admin.service.ts` — [تعديل]

```typescript
// ──── كتابة Audit Log ────
private async writeAuditLog(companyId: string, actorUserId: string, action: string, targetType: string, targetId: string, details?: any) {
  await db.insert(companyAuditLogs).values({
    companyId,
    actorUserId,
    action,
    targetType,
    targetId,
    details: details ?? null,
  })
}
```

#### `apps/backend/src/modules/admin/admin.controller.ts` — [تعديل]

```typescript
// GET /admin/audit-logs — عرض سجل نشاطات الشركة
@Get('audit-logs')
async getAuditLogs(
  @Req() req,
  @Query('limit') limit?: string,
  @Query('action') action?: string,
) { ... }
```

#### `src/app/(dashboard)/dashboard/audit-logs/page.tsx` — [تعديل]

ربطها بـ `GET /admin/audit-logs` (بدلاً من endpoint فارغ).

---

## 7. المرحلة 5 — تحسينات أمنية وتشغيلية

> **الأولوية:** 🟢 متوسطة  
> **المدة التقديرية:** 2-3 ساعات  
> **المتطلبات المسبقة:** المراحل 1-4

### 7.1 فحص isActive في Tenant Middleware

#### `apps/backend/src/common/tenant/tenant.middleware.ts` — [تعديل]

```typescript
// ──── بعد استخراج userId ────
// التحقق من أن المستخدم نشط (غير معطّل)
if (userId) {
  const profile = await db.select({ isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (profile.length > 0 && profile[0].isActive === false) {
    return res.status(403).json({
      success: false,
      error: { code: 'USER_DISABLED', message: 'حسابك معطّل. تواصل مع المسؤول.' }
    })
  }
}
```

### 7.2 إزالة x-company-id من Production

#### `apps/backend/src/common/tenant/tenant.middleware.ts` — [تعديل]

```typescript
// ──── في production: فقط JWT ────
if (process.env.NODE_ENV === 'production') {
  // لا نقبل x-company-id أو x-user-id من headers
  // المصدر الوحيد: JWT cookie
}
```

### 7.3 Frontend Middleware — حماية صفحة المستخدمين

#### `src/middleware.ts` — [تعديل]

```typescript
// ──── حماية صفحات الإدارة ────
// /dashboard/settings/users يتطلب role === 'admin' أو 'owner'
if (pathname.startsWith('/dashboard/settings/users')) {
  const role = profile?.role
  if (role !== 'admin' && role !== 'owner' && role !== 'platform_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

---

## 8. خريطة الملفات (File Map)

### ملفات جديدة (مطلوب إنشاؤها)

| # | الملف | المرحلة | الوصف |
|---|-------|---------|-------|
| 1 | `src/app/(dashboard)/dashboard/settings/users/page.tsx` | 2 | صفحة إدارة المستخدمين |
| 2 | `src/components/settings/UsersManagement.tsx` | 2 | Client Component لإدارة المستخدمين |
| 3 | `apps/backend/src/common/rbac/require-permission.decorator.ts` | 3 | Decorator لفرض الصلاحيات |
| 4 | `apps/backend/src/common/rbac/permission.guard.ts` | 3 | Guard للتحقق من الصلاحيات |
| 5 | `src/components/dashboard/TeamWidget.tsx` | 4 | Widget الفريق في الداشبورد |
| 6 | `src/app/(dashboard)/dashboard/settings/roles/page.tsx` | 3 (اختياري) | صفحة إدارة الأدوار |

### ملفات موجودة (مطلوب تعديلها)

| # | الملف | المرحلة | نوع التعديل |
|---|-------|---------|-------------|
| 1 | `apps/backend/src/modules/admin/admin.controller.ts` | 1 | إضافة 5 endpoints جديدة |
| 2 | `apps/backend/src/modules/admin/admin.service.ts` | 1 | إضافة 5 دوال جديدة |
| 3 | `src/lib/api/admin.ts` | 1 | إضافة 4 methods (create/update/toggle/reset) |
| 4 | `src/lib/actions/settings.actions.ts` | 1 | إضافة 5 Server Actions |
| 5 | `src/components/settings/SettingsNav.tsx` | 2 | إضافة تاب "المستخدمون" |
| 6 | `src/components/layout/dashboard-nav-items.ts` | 2 | إضافة رابط "المستخدمون" |
| 7 | `apps/backend/src/common/db/schema.ts` | 3+4 | إضافة user_roles + company_audit_logs |
| 8 | `apps/backend/src/common/rbac/policy-evaluator.service.ts` | 3 | تحديث getEffectivePermissions |
| 9 | `apps/backend/src/common/rbac/permission-keys.ts` | 3 | إضافة 7 مفاتيح جديدة |
| 10 | `src/app/(dashboard)/dashboard/page.tsx` | 4 | إضافة TeamWidget |
| 11 | `src/app/(dashboard)/dashboard/audit-logs/page.tsx` | 4 | ربط ببيانات حقيقية |
| 12 | `apps/backend/src/common/tenant/tenant.middleware.ts` | 5 | إضافة فحص isActive |
| 13 | `src/middleware.ts` | 5 | حماية صفحة المستخدمين |

### ملفات توثيقية (مطلوب تحديثها)

| # | الملف | التعديل |
|---|-------|---------|
| 1 | `docs/api_contract_v1.md` | إضافة Admin Users section |
| 2 | `docs/api_contract_map.md` | إضافة frontend-backend mapping |
| 3 | `docs/screens_map.md` | إضافة شاشة المستخدمين |
| 4 | `docs/CONTEXT.md` | تحديث Agent outputs |

---

## 9. API Contract الجديد

### Admin Users — `/v1/admin/users`

```
┌────────┬────────────────────────────────┬──────────────┬──────────────────┐
│ Method │ Path                           │ Permission   │ Description      │
├────────┼────────────────────────────────┼──────────────┼──────────────────┤
│ GET    │ /v1/admin/users                │ users.read   │ عرض المستخدمين   │
│ POST   │ /v1/admin/users                │ users.manage │ إنشاء مستخدم    │
│ PATCH  │ /v1/admin/users/:id            │ users.manage │ تعديل مستخدم    │
│ DELETE │ /v1/admin/users/:id            │ users.manage │ تعطيل مستخدم    │
│ POST   │ /v1/admin/users/:id/toggle     │ users.manage │ تبديل الحالة    │
│ POST   │ /v1/admin/users/:id/reset-pwd  │ users.manage │ كلمة مرور مؤقتة │
├────────┼────────────────────────────────┼──────────────┼──────────────────┤
│ GET    │ /v1/admin/roles                │ roles.manage │ عرض الأدوار     │
│ POST   │ /v1/admin/roles                │ roles.manage │ إنشاء دور       │
│ PATCH  │ /v1/admin/roles/:id            │ roles.manage │ تعديل صلاحيات   │
│ DELETE │ /v1/admin/roles/:id            │ roles.manage │ حذف دور مخصص   │
├────────┼────────────────────────────────┼──────────────┼──────────────────┤
│ GET    │ /v1/admin/audit-logs           │ audit.read   │ سجل النشاطات   │
└────────┴────────────────────────────────┴──────────────┴──────────────────┘
```

### Request/Response Shapes

```typescript
// ──── POST /v1/admin/users ────
// Request:
{
  "email": "ahmed@company.com",
  "password": "securePass123",
  "fullName": "أحمد محمد",
  "role": "cashier",
  "branchId": "uuid-optional",
  "phone": "01234567890"
}
// Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "ahmed@company.com",
    "fullName": "أحمد محمد",
    "role": "cashier",
    "branchId": "uuid",
    "branchName": "فرع 1",
    "isActive": true,
    "createdAt": "2026-04-27T..."
  }
}

// ──── PATCH /v1/admin/users/:id ────
// Request:
{
  "reason": "ترقية لمدير",
  "role": "manager",
  "branchId": null
}
// Response:
{ "success": true, "data": { "updated": true } }

// ──── POST /v1/admin/users/:id/reset-pwd ────
// Request:
{ "reason": "نسى كلمة المرور" }
// Response:
{ "success": true, "data": { "tempPassword": "xK7#m9Pz" } }
```

---

## 10. خطة التحقق والاختبار

### 10.1 اختبارات Backend (محلية)

```bash
# 1. Build check
cd apps/backend && npm run build

# 2. Manual API testing (curl)
# إنشاء مستخدم
curl -X POST http://localhost:4000/v1/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=..." \
  -d '{"email":"test@co.com","password":"test123","fullName":"تجربة","role":"cashier"}'

# عرض المستخدمين
curl http://localhost:4000/v1/admin/users \
  -H "Cookie: access_token=..."

# تعطيل مستخدم
curl -X POST http://localhost:4000/v1/admin/users/{userId}/toggle-active \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=..." \
  -d '{"reason":"تعطيل مؤقت"}'
```

### 10.2 اختبارات Frontend (متصفح)

| # | السيناريو | الخطوات | النتيجة المتوقعة |
|---|-----------|---------|-----------------|
| 1 | عرض صفحة المستخدمين | تسجيل دخول كـ owner → الإعدادات → المستخدمون | جدول بكل المستخدمين |
| 2 | إضافة مستخدم | ضغط "إضافة" → ملء الفورم → تأكيد | ظهور المستخدم في الجدول |
| 3 | تعديل دور | ضغط تعديل → تغيير الدور → حفظ | تحديث Badge الدور |
| 4 | تعطيل مستخدم | ضغط تعطيل → إدخال سبب → تأكيد | تغير الحالة لـ "موقوف" |
| 5 | إعادة كلمة المرور | ضغط إعادة → إدخال سبب → تأكيد | ظهور كلمة مؤقتة في toast |
| 6 | Tenant Isolation | مستخدم شركة A يحاول رؤية مستخدمي شركة B | فشل + 403 |
| 7 | حماية الصفحة | تسجيل دخول كـ cashier → `/settings/users` | redirect لـ `/dashboard` |
| 8 | فلترة | بحث بالاسم + فلتر بالدور | نتائج مُفلترة |

### 10.3 أمان

- [ ] مستخدم معطّل لا يستطيع تسجيل الدخول
- [ ] لا يمكن تعطيل owner
- [ ] لا يمكن حذف النفس
- [ ] كل عملية حساسة لها audit log
- [ ] كلمة المرور المؤقتة عشوائية وقوية (8+ أحرف + أرقام + رموز)

---

## 11. Checklist التنفيذ

### المرحلة 1 — Backend APIs (الأولوية 🔴)

- [ ] إضافة DTOs (CreateUserDto, UpdateUserDto, ReasonDto)
- [ ] تنفيذ `AdminService.createUser()`
- [ ] تنفيذ `AdminService.updateUser()`
- [ ] تنفيذ `AdminService.toggleUserActive()`
- [ ] تنفيذ `AdminService.resetUserPassword()`
- [ ] تحسين `AdminService.listUsers()` (إضافة branchName, lastLoginAt)
- [ ] إضافة Endpoints في `AdminController`
- [ ] تحديث `src/lib/api/admin.ts` (API adapter)
- [ ] إضافة Server Actions في `settings.actions.ts`
- [ ] اختبار curl لكل endpoint

### المرحلة 2 — Frontend Pages (الأولوية 🔴)

- [ ] إنشاء `src/app/(dashboard)/dashboard/settings/users/page.tsx`
- [ ] إنشاء `src/components/settings/UsersManagement.tsx`
- [ ] إنشاء `UserFormDialog` component
- [ ] إنشاء `UserRowActions` component
- [ ] تعديل `SettingsNav.tsx` — إضافة تاب المستخدمون
- [ ] تعديل `dashboard-nav-items.ts` — إضافة رابط المستخدمون
- [ ] اختبار في المتصفح (إضافة + تعديل + تعطيل + reset)

### المرحلة 3 — RBAC (الأولوية 🟡)

- [x] إضافة `userRoles` جدول في schema.ts
- [x] تشغيل migration
- [x] تحديث `PolicyEvaluatorService`
- [x] إنشاء `RequirePermission` decorator
- [x] إنشاء `PermissionGuard`
- [x] تطبيق Guard على endpoints الحساسة
- [x] تحديث `permission-keys.ts`
- [x] اختبار: endpoint محمي يرفض بدون permission

### المرحلة 4 — Dashboard + Audit (الأولوية 🟡)

- [ ] إنشاء `company_audit_logs` جدول في schema.ts
- [ ] تشغيل migration
- [ ] تنفيذ `writeAuditLog()` helper في AdminService
- [ ] كتابة audit log في كل عملية CRUD users
- [ ] إنشاء `GET /admin/audit-logs` endpoint
- [ ] ربط `/dashboard/audit-logs` ببيانات حقيقية
- [ ] إنشاء `TeamWidget` component
- [ ] إضافة TeamWidget في الداشبورد

### المرحلة 5 — أمان (الأولوية 🟢)

- [ ] فحص isActive في Tenant Middleware
- [ ] إزالة x-company-id في production
- [ ] حماية صفحة المستخدمين في Frontend Middleware
- [ ] مراجعة كل endpoints تستخدم companyId

### التوثيق (بعد الانتهاء)

- [ ] تحديث `docs/api_contract_v1.md`
- [ ] تحديث `docs/api_contract_map.md`
- [ ] تحديث `docs/screens_map.md`
- [ ] تحديث `docs/CONTEXT.md`

---

## المراجع

| الملف | الوصف |
|-------|-------|
| [`docs/api_contract_v1.md`](../api_contract_v1.md) | العقد الرسمي للـ APIs |
| [`docs/api_contract_map.md`](../api_contract_map.md) | خريطة ربط Frontend ↔ Backend |
| [`docs/screens_map.md`](../screens_map.md) | خريطة الشاشات والصلاحيات |
| [`docs/plans/system_rbac_ops_plan.md`](./system_rbac_ops_plan.md) | خطة RBAC الأصلية |
| [`docs/CONTEXT.md`](../CONTEXT.md) | سياق المشروع العام |
| [`.agents/agent-13-backend-general.md`](../../.agents/agent-13-backend-general.md) | تعليمات الـ Backend Agent |
