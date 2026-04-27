# 🎯 الخطة التنفيذية الشاملة — النظام الإداري + الاشتراكات + الصلاحيات

> **الإصدار:** 1.0 | **التاريخ:** 27 أبريل 2026  
> **الحالة:** 🔴 في انتظار الموافقة  
> **يغطي:** إدارة المستخدمين، RBAC، الاشتراكات، الدفع، Audit، Super Admin، Marketing

---

## 📑 فهرس المحتويات

1. [ملخص الحالة الحالية](#1-ملخص-الحالة-الحالية)
2. [المرحلة A — إدارة مستخدمي الشركة (CRUD)](#2-المرحلة-a--إدارة-مستخدمي-الشركة)
3. [المرحلة B — نظام الصلاحيات RBAC](#3-المرحلة-b--نظام-الصلاحيات-rbac)
4. [المرحلة C — Audit Logs على مستوى الشركة](#4-المرحلة-c--audit-logs-على-مستوى-الشركة)
5. [المرحلة D — تفعيل الاشتراكات وفرض الحدود](#5-المرحلة-d--تفعيل-الاشتراكات-وفرض-الحدود)
6. [المرحلة E — بوابة الدفع](#6-المرحلة-e--بوابة-الدفع)
7. [المرحلة F — تحسينات Super Admin](#7-المرحلة-f--تحسينات-super-admin)
8. [خريطة الملفات الكاملة](#8-خريطة-الملفات-الكاملة)
9. [تحديثات التوثيق المطلوبة](#9-تحديثات-التوثيق-المطلوبة)
10. [Checklist الكامل](#10-checklist-الكامل)

---

## 1. ملخص الحالة الحالية

### نسب الإنجاز

```
Super Admin Dashboard    ████████░░  85%   ← شبه مكتمل
Company Admin Settings   █████░░░░░  50%   ← ينقصه users/roles
RBAC (الصلاحيات)         ███░░░░░░░  30%   ← بنية فقط — غير مُفعّل
اشتراكات + دفع          ██░░░░░░░░  25%   ← هيكل بدون بوابة
Audit Logs (Company)     █░░░░░░░░░   5%   ← فارغ تماماً
حماية المسارات          ███████░░░  70%   ← JWT + sub check — بدون role check
```

### خريطة الملفات الموجودة حالياً

```
🔹 Backend (apps/backend/src/)
├── common/
│   ├── db/schema.ts                     ← 765 سطر — كل الجداول
│   ├── rbac/
│   │   ├── permission-keys.ts           ← 13 مفتاح صلاحية
│   │   └── policy-evaluator.service.ts  ← getEffectivePermissions() — غير مُستخدم!
│   ├── tenant/tenant.middleware.ts      ← استخراج companyId/userId من JWT
│   └── audit/platform-audit.service.ts  ← كتابة audit للـ super-admin فقط
├── modules/
│   ├── admin/
│   │   ├── admin.controller.ts          ← branches/warehouses/company/users(GET)/print
│   │   ├── admin.service.ts             ← Business logic
│   │   └── admin.module.ts
│   ├── platform-admin/
│   │   ├── platform-admin.controller.ts ← overview/companies/users/rbac/audit/org (كامل)
│   │   ├── platform-admin.service.ts    ← 739 سطر
│   │   ├── platform-admin.guard.ts      ← role === platform_admin
│   │   └── platform-admin.module.ts
│   ├── auth/auth.service.ts             ← يقرأ subscription status
│   └── onboarding/onboarding.service.ts ← ينشئ subscription عند التسجيل

🔹 Frontend (src/)
├── app/
│   ├── (dashboard)/dashboard/
│   │   ├── settings/
│   │   │   ├── company/     ← ✅
│   │   │   ├── branches/    ← ✅
│   │   │   ├── warehouses/  ← ✅
│   │   │   ├── variables/   ← ✅
│   │   │   ├── invoice/     ← ✅
│   │   │   ├── printing/    ← ✅
│   │   │   └── ❌ users/    ← غير موجود!
│   │   └── audit-logs/      ← موجود لكن يُرجّع []
│   ├── (billing)/billing/
│   │   ├── page.tsx          ← ✅ (client — usage metrics)
│   │   ├── history/          ← ✅ (فارغ)
│   │   ├── expired/          ← ✅ (WhatsApp + logout)
│   │   └── upgrade/          ← ✅ (موجود)
│   ├── (super-admin)/super-admin/
│   │   ├── page.tsx          ← ✅ (overview)
│   │   ├── companies/        ← ✅
│   │   ├── users/            ← ✅
│   │   ├── rbac/             ← ✅
│   │   ├── org/              ← ✅
│   │   └── audit-logs/       ← ✅
│   └── (marketing)/          ← Landing + terms + privacy
├── components/settings/SettingsNav.tsx ← 6 تابات (بدون users)
├── lib/
│   ├── api/admin.ts          ← listUsers فقط
│   ├── api/platform-admin.ts ← كامل
│   └── plan-limits.ts        ← كله stubs = true
└── middleware.ts             ← JWT + subscription + super-admin check
```

---

## 2. المرحلة A — إدارة مستخدمي الشركة

> **الأولوية:** 🔴 قصوى | **المدة:** 6-8 ساعات | **التبعيات:** لا يوجد

### A.1 Backend — DTOs جديدة

**ملف:** `apps/backend/src/modules/admin/admin.controller.ts` — إضافة في بداية الملف

```typescript
// ──── DTOs لإدارة المستخدمين ────
class CreateUserDto {
  @IsEmail() email!: string
  @MinLength(6) password!: string
  @IsNotEmpty() fullName!: string
  @IsIn(['admin', 'manager', 'cashier', 'viewer']) role!: string
  @IsOptional() @IsUUID() branchId?: string
  @IsOptional() @IsString() phone?: string
}

class UpdateUserDto {
  @IsNotEmpty() @MinLength(3) reason!: string
  @IsOptional() @IsString() fullName?: string
  @IsOptional() @IsIn(['admin', 'manager', 'cashier', 'viewer']) role?: string
  @IsOptional() branchId?: string | null
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsBoolean() isActive?: boolean
}

class ReasonDto {
  @IsNotEmpty() @MinLength(3) reason!: string
}
```

### A.2 Backend — Endpoints جديدة

**ملف:** `apps/backend/src/modules/admin/admin.controller.ts` — إضافة بعد `@Get('users')`

```typescript
// POST /admin/users — إنشاء مستخدم جديد للشركة
@Post('users')
async createUser(
  @Headers('x-company-id') companyId: string | undefined,
  @Body() body: CreateUserDto,
) {
  if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY' })
  const actorUserId = requireUserId()
  const result = await this.adminService.createUser(companyId, actorUserId, body)
  return { success: true, data: result }
}

// PATCH /admin/users/:id — تعديل بيانات مستخدم
@Patch('users/:id')
async updateUser(
  @Headers('x-company-id') companyId: string | undefined,
  @Param('id') id: string,
  @Body() body: UpdateUserDto,
) {
  if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY' })
  const actorUserId = requireUserId()
  const result = await this.adminService.updateUser(companyId, actorUserId, id, body)
  return { success: true, data: result }
}

// POST /admin/users/:id/toggle-active — تبديل حالة المستخدم
@Post('users/:id/toggle-active')
async toggleUserActive(
  @Headers('x-company-id') companyId: string | undefined,
  @Param('id') id: string,
  @Body() body: ReasonDto,
) {
  if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY' })
  const actorUserId = requireUserId()
  const result = await this.adminService.toggleUserActive(companyId, actorUserId, id, body.reason)
  return { success: true, data: result }
}

// POST /admin/users/:id/reset-password — إعادة تعيين كلمة المرور
@Post('users/:id/reset-password')
async resetUserPassword(
  @Headers('x-company-id') companyId: string | undefined,
  @Param('id') id: string,
  @Body() body: ReasonDto,
) {
  if (!companyId) throw new BadRequestException({ code: 'MISSING_COMPANY' })
  const actorUserId = requireUserId()
  const result = await this.adminService.resetUserPassword(companyId, actorUserId, id, body.reason)
  return { success: true, data: result }
}
```

### A.3 Backend — Service Methods

**ملف:** `apps/backend/src/modules/admin/admin.service.ts` — إضافة دوال جديدة

```typescript
// ──── إنشاء مستخدم ────
async createUser(companyId: string, actorUserId: string, data: {
  email: string; password: string; fullName: string;
  role: string; branchId?: string; phone?: string;
}) {
  // 1. إنشاء في جدول users (hash password)
  // 2. إنشاء profile مرتبط بالشركة
  // 3. كتابة audit log
  // 4. إرجاع بيانات المستخدم الجديد
}

// ──── تعديل مستخدم ────
async updateUser(companyId: string, actorUserId: string, userId: string, patch: {
  reason: string; fullName?: string; role?: string;
  branchId?: string | null; phone?: string; isActive?: boolean;
}) {
  // 1. التحقق أن المستخدم ينتمي لنفس الشركة
  // 2. منع تعديل owner أو النفس (إذا كان role change)
  // 3. تطبيق التعديلات
  // 4. كتابة audit log
}

// ──── تبديل الحالة ────
async toggleUserActive(companyId: string, actorUserId: string, userId: string, reason: string) {
  // 1. منع تعطيل النفس
  // 2. منع تعطيل owner
  // 3. تغيير isActive
  // 4. كتابة audit log
}

// ──── إعادة تعيين كلمة المرور ────
async resetUserPassword(companyId: string, actorUserId: string, userId: string, reason: string) {
  // 1. توليد كلمة مرور مؤقتة (8+ أحرف + أرقام + رموز)
  // 2. تحديث في جدول users
  // 3. كتابة audit log
  // 4. إرجاع { tempPassword }
}

// ──── تحسين listUsers ────
// إضافة: branchName, lastLoginAt, phone
```

### A.4 Frontend — API Adapter

**ملف:** `src/lib/api/admin.ts` — إضافة methods جديدة

```typescript
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

// ──── الإضافات في adminApi ────
createUser: (payload: {
  email: string; password: string; fullName: string;
  role: string; branchId?: string; phone?: string;
}) => backendFetch<AdminUser>('/admin/users', { method: 'POST', body: payload }),

updateUser: (id: string, payload: {
  reason: string; fullName?: string; role?: string;
  branchId?: string | null; phone?: string; isActive?: boolean;
}) => backendFetch<{ updated: true }>(`/admin/users/${id}`, { method: 'PATCH', body: payload }),

toggleUserActive: (id: string, payload: { reason: string }) =>
  backendFetch<{ isActive: boolean }>(`/admin/users/${id}/toggle-active`, { method: 'POST', body: payload }),

resetUserPassword: (id: string, payload: { reason: string }) =>
  backendFetch<{ tempPassword: string }>(`/admin/users/${id}/reset-password`, { method: 'POST', body: payload }),
```

### A.5 Frontend — Server Actions

**ملف:** `src/lib/actions/settings.actions.ts` — إضافة

```typescript
'use server'
import { adminApi } from '@/lib/api/admin'
import { revalidatePath } from 'next/cache'

export async function listCompanyUsers() { return adminApi.listUsers() }
export async function createCompanyUser(data: Parameters<typeof adminApi.createUser>[0]) {
  const result = await adminApi.createUser(data)
  revalidatePath('/dashboard/settings/users')
  return result
}
export async function updateCompanyUser(id: string, data: Parameters<typeof adminApi.updateUser>[1]) {
  const result = await adminApi.updateUser(id, data)
  revalidatePath('/dashboard/settings/users')
  return result
}
export async function toggleCompanyUserActive(id: string, reason: string) {
  const result = await adminApi.toggleUserActive(id, { reason })
  revalidatePath('/dashboard/settings/users')
  return result
}
export async function resetCompanyUserPassword(id: string, reason: string) {
  return adminApi.resetUserPassword(id, { reason })
}
```

### A.6 Frontend — صفحة إدارة المستخدمين

**ملف جديد:** `src/app/(dashboard)/dashboard/settings/users/page.tsx`

```
الصفحة تحتوي:
─────────────────────────────────────────────
│ المستخدمون                  [+ إضافة مستخدم] │
│ إدارة مستخدمي الشركة وصلاحياتهم              │
├─────────────────────────────────────────────┤
│ [بحث...] [الدور ▼] [الحالة ▼]                │
├──────┬────────┬───────┬──────┬──────┬───────┤
│ الاسم │ البريد │ الدور │ الفرع │الحالة│ إجراء │
├──────┼────────┼───────┼──────┼──────┼───────┤
│ أحمد │ a@..   │ كاشير│ فرع1 │ ✅   │ ⋮ ▼   │
└──────┴────────┴───────┴──────┴──────┴───────┘

أزرار الإجراءات:
✏️ تعديل    → يفتح UserFormDialog
🔄 تعطيل    → ReasonDialog → toggleActive
🔑 كلمة مرور → ReasonDialog → resetPassword → toast بالكلمة المؤقتة
```

**ملف جديد:** `src/components/settings/UsersManagement.tsx` — Client Component

### A.7 Frontend — تعديل Navigation

**ملف:** `src/components/settings/SettingsNav.tsx`

```diff
+import { Users } from "lucide-react"
 const items = [
   { title: "الشركة والمنطقة", href: "...", icon: Globe2 },
   { title: "الفروع", href: "...", icon: Building2 },
   { title: "المخازن", href: "...", icon: Package2 },
+  { title: "المستخدمون", href: "/dashboard/settings/users", icon: Users },
   { title: "المتغيرات", href: "...", icon: SlidersHorizontal },
   ...
 ]
```

**ملف:** `src/components/layout/dashboard-nav-items.ts`

```diff
 { title: "النظام", items: [
+  { icon: Users, label: "المستخدمون", href: "/dashboard/settings/users" },
   { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs" },
   ...
 ]}
```

---

## 3. المرحلة B — نظام الصلاحيات RBAC

> **الأولوية:** 🔴 قصوى | **المدة:** 4-5 ساعات | **التبعيات:** المرحلة A

### B.1 Backend — جدول `user_roles`

**ملف:** `apps/backend/src/common/db/schema.ts` — إضافة بعد `userPermissionOverrides`

```typescript
export const userRoles = pgTable('user_roles', {
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId:    uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
  companyIdx: index('user_roles_company_idx').on(t.companyId),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  company: one(companies, { fields: [userRoles.companyId], references: [companies.id] }),
}))
```

**Migration:** `npx drizzle-kit generate` ثم `npx drizzle-kit push`

### B.2 Backend — توسيع Permission Keys

**ملف:** `apps/backend/src/common/rbac/permission-keys.ts` — استبدال كامل

```typescript
export const PERMISSION_KEYS = [
  // ──── المخزون ────
  'inventory.read',
  'inventory.write',

  // ──── المبيعات ────
  'sales.read',
  'sales.write',
  'sales.void',              // ← جديد
  'sales.discount',          // ← جديد

  // ──── المشتريات ────
  'purchases.read',          // ← جديد
  'purchases.write',         // ← جديد

  // ──── المالية ────
  'finance.read',
  'finance.write',

  // ──── التقارير ────
  'reports.read',
  'reports.view_costs',

  // ──── جهات الاتصال ────
  'contacts.read',           // ← جديد
  'contacts.write',          // ← جديد

  // ──── الإدارة ────
  'admin.users.read',        // ← جديد
  'admin.users.manage',
  'admin.roles.manage',      // ← جديد
  'admin.settings.manage',
  'admin.audit.read',        // ← جديد

  // ──── المنصة ────
  'platform.companies.manage',
  'platform.users.manage',
  'platform.ops.execute',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]
export const PERMISSION_EFFECTS = ['allow', 'deny'] as const
export type PermissionEffect = (typeof PERMISSION_EFFECTS)[number]
```

### B.3 Backend — RequirePermission Decorator

**ملف جديد:** `apps/backend/src/common/rbac/require-permission.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common'

export const REQUIRED_PERMISSION_KEY = 'required_permission'
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permissions)
```

### B.4 Backend — PermissionGuard

**ملف جديد:** `apps/backend/src/common/rbac/permission.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PolicyEvaluatorService } from './policy-evaluator.service'
import { REQUIRED_PERMISSION_KEY } from './require-permission.decorator'

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
    const companyId = request.companyId ?? request.headers?.['x-company-id']

    if (!userId || !companyId) return false

    // platform_admin يمر دائماً
    if (request.userRole === 'platform_admin') return true

    const effective = await this.policyEvaluator.getEffectivePermissions({
      userId, companyId,
    })
    return requiredPerms.every(p => effective.has(p))
  }
}
```

### B.5 Backend — تحديث PolicyEvaluator

**ملف:** `apps/backend/src/common/rbac/policy-evaluator.service.ts`

التحديث المطلوب: إضافة دعم لجدول `user_roles` مع fallback لـ `profiles.role`:

```typescript
async getEffectivePermissions(params: { userId: string; companyId: string }): Promise<Set<string>> {
  const allowed = new Set<string>()
  if (!db) return allowed

  // 1. جلب أدوار المستخدم من user_roles (الجديد)
  let userRoleIds: string[] = []
  try {
    const assignments = await db.select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(and(eq(userRoles.userId, params.userId), eq(userRoles.companyId, params.companyId)))
    userRoleIds = assignments.map(a => a.roleId)
  } catch { /* جدول غير موجود بعد — fallback */ }

  // 2. Fallback: إذا لم يكن في user_roles → profiles.role → roles بنفس الاسم
  if (userRoleIds.length === 0) {
    const perms = await db.execute<{ permission_key: string }>(sql`
      select rp.permission_key from role_permissions rp
      join roles r on r.id = rp.role_id
      where r.company_id = ${params.companyId}
    `)
    for (const p of perms.rows) allowed.add(String(p.permission_key))
  } else {
    // جلب صلاحيات الأدوار المحددة
    const perms = await db.select({ key: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, userRoleIds))
    for (const p of perms) allowed.add(p.key)
  }

  // 3. Apply user overrides (deny wins last)
  const overrides = await db.select({
    permissionKey: userPermissionOverrides.permissionKey,
    effect: userPermissionOverrides.effect,
  }).from(userPermissionOverrides)
    .where(sql`${userPermissionOverrides.userId} = ${params.userId}
           and ${userPermissionOverrides.companyId} = ${params.companyId}`)

  for (const o of overrides) {
    if (String(o.effect) === 'deny') allowed.delete(String(o.permissionKey))
    if (String(o.effect) === 'allow') allowed.add(String(o.permissionKey))
  }

  return allowed
}
```

### B.6 Backend — تطبيق Guard على Admin Endpoints

**ملف:** `apps/backend/src/modules/admin/admin.controller.ts` — إضافة Guards

```typescript
import { UseGuards } from '@nestjs/common'
import { PermissionGuard } from '../../common/rbac/permission.guard'
import { RequirePermission } from '../../common/rbac/require-permission.decorator'

// ──── المستخدمون ────
@Get('users')
@UseGuards(PermissionGuard) @RequirePermission('admin.users.read')
async users(...) { ... }

@Post('users')
@UseGuards(PermissionGuard) @RequirePermission('admin.users.manage')
async createUser(...) { ... }

@Patch('users/:id')
@UseGuards(PermissionGuard) @RequirePermission('admin.users.manage')
async updateUser(...) { ... }

// ──── الإعدادات ────
@Post('company')
@UseGuards(PermissionGuard) @RequirePermission('admin.settings.manage')
async updateCompany(...) { ... }

@Post('branches')
@UseGuards(PermissionGuard) @RequirePermission('admin.settings.manage')
async createBranch(...) { ... }
```

### B.7 Frontend — حماية صفحة المستخدمين

**ملف:** `src/middleware.ts` — إضافة بعد super-admin check

```typescript
// حماية صفحات الإدارة للأدمن فقط
if (pathname.startsWith('/dashboard/settings/users')) {
  const role = profile?.role
  if (role !== 'admin' && role !== 'owner' && role !== 'platform_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### B.8 Frontend — إخفاء عناصر حسب الدور

**فكرة التنفيذ:** إنشاء hook `usePermissions()` يقرأ role من session ويُخفي العناصر:

```typescript
// src/hooks/use-permissions.ts — جديد
export function usePermissions() {
  const { profile } = useAuth()
  const role = profile?.role ?? 'viewer'

  return {
    canManageUsers: ['admin', 'owner', 'platform_admin'].includes(role),
    canManageSettings: ['admin', 'owner', 'platform_admin'].includes(role),
    canViewReports: role !== 'cashier',
    canVoidSales: ['admin', 'owner', 'manager'].includes(role),
  }
}
```

---

## 4. المرحلة C — Audit Logs على مستوى الشركة

> **الأولوية:** 🟡 عالية | **المدة:** 2-3 ساعات | **التبعيات:** المرحلة A

### C.1 Backend — جدول جديد

**ملف:** `apps/backend/src/common/db/schema.ts` — إضافة بعد `platformAuditLogs`

```typescript
export const companyAuditLogs = pgTable('company_audit_logs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  actorUserId: uuid('actor_user_id').notNull(),
  action:      text('action').notNull(),                    // e.g., 'user.create', 'user.disable'
  targetType:  text('target_type'),                          // e.g., 'user', 'branch', 'settings'
  targetId:    text('target_id'),
  details:     text('details'),                              // JSON string
  ip:          text('ip'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

### C.2 Backend — Helper للكتابة

**ملف:** `apps/backend/src/modules/admin/admin.service.ts` — إضافة

```typescript
private async writeAuditLog(
  companyId: string,
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>,
) {
  try {
    await db.insert(companyAuditLogs).values({
      companyId, actorUserId, action,
      targetType, targetId,
      details: details ? JSON.stringify(details) : null,
    })
  } catch (e) {
    console.error('Audit log write failed:', e)
  }
}
```

**استدعاؤه في كل عملية:**
```typescript
// عند إنشاء مستخدم
await this.writeAuditLog(companyId, actorUserId, 'user.create', 'user', newUser.id, { email, role })
// عند تعطيل مستخدم
await this.writeAuditLog(companyId, actorUserId, 'user.toggle_active', 'user', userId, { reason, newStatus })
// عند تعديل إعدادات
await this.writeAuditLog(companyId, actorUserId, 'settings.update', 'company', companyId, { changes })
```

### C.3 Backend — تفعيل GET /admin/audit-logs

**ملف:** `apps/backend/src/modules/admin/admin.controller.ts` — استبدال

```typescript
@Get('audit-logs')
async auditLogs(
  @Headers('x-company-id') companyId?: string,
  @Query('limit') limit?: string,
  @Query('action') action?: string,
) {
  if (!companyId) return { success: true, data: [] }
  const items = await this.adminService.listAuditLogs(companyId, {
    limit: Math.min(parseInt(limit || '100'), 500),
    action: action?.trim(),
  })
  return { success: true, data: items }
}
```

### C.4 Frontend — ربط الصفحة

**ملف:** `src/app/(dashboard)/dashboard/audit-logs/page.tsx`

تعديل لاستدعاء `GET /admin/audit-logs` بدلاً من إرجاع array فارغ.

---

## 5. المرحلة D — تفعيل الاشتراكات وفرض الحدود

> **الأولوية:** 🟡 عالية | **المدة:** 4-6 ساعات | **التبعيات:** لا يوجد

### D.1 Backend — Billing API

**ملف جديد:** `apps/backend/src/modules/billing/billing.controller.ts`

```typescript
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // GET /billing/current — حالة الاشتراك + الاستخدام
  @Get('current')
  async getCurrent(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException('MISSING_COMPANY')
    const data = await this.billingService.getCurrentBilling(companyId)
    return { success: true, data }
  }

  // GET /billing/usage — إحصائيات الاستخدام
  @Get('usage')
  async getUsage(@Headers('x-company-id') companyId?: string) {
    if (!companyId) throw new BadRequestException('MISSING_COMPANY')
    const data = await this.billingService.getUsageStats(companyId)
    return { success: true, data }
  }
}
```

**ملف جديد:** `apps/backend/src/modules/billing/billing.service.ts`

```typescript
@Injectable()
export class BillingService {
  async getCurrentBilling(companyId: string) {
    // 1. جلب subscription + plan
    // 2. جلب usage (users count, products count, branches count, invoices this month)
    // 3. حساب النسب
    return {
      plan: { name, monthlyPrice, limits },
      subscription: { status, currentPeriodEnd },
      usage: {
        users: { current: 3, max: 10, percentage: 30 },
        products: { current: 450, max: 5000, percentage: 9 },
        branches: { current: 2, max: 5, percentage: 40 },
        invoicesThisMonth: { current: 234, max: 5000, percentage: 5 },
      }
    }
  }
}
```

### D.2 Frontend — تفعيل plan-limits.ts

**ملف:** `src/lib/plan-limits.ts` — استبدال كامل

```typescript
import { backendFetch } from '@/lib/api/backend-client'

type UsageData = {
  users: { current: number; max: number | null }
  products: { current: number; max: number | null }
  branches: { current: number; max: number | null }
  invoicesThisMonth: { current: number; max: number | null }
}

let cachedUsage: UsageData | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

async function getUsage(): Promise<UsageData | null> {
  if (cachedUsage && Date.now() - cacheTime < CACHE_TTL) return cachedUsage
  try {
    const data = await backendFetch<{ usage: UsageData }>('/billing/usage')
    cachedUsage = (data as any)?.usage ?? null
    cacheTime = Date.now()
    return cachedUsage
  } catch { return null }
}

export async function canAddUser(): Promise<boolean> {
  const u = await getUsage()
  if (!u?.users.max) return true
  return u.users.current < u.users.max
}

export async function canAddProduct(): Promise<boolean> {
  const u = await getUsage()
  if (!u?.products.max) return true
  return u.products.current < u.products.max
}

export async function canAddBranch(): Promise<boolean> {
  const u = await getUsage()
  if (!u?.branches.max) return true
  return u.branches.current < u.branches.max
}

export async function canCreateInvoice(): Promise<boolean> {
  const u = await getUsage()
  if (!u?.invoicesThisMonth.max) return true
  return u.invoicesThisMonth.current < u.invoicesThisMonth.max
}
```

### D.3 Backend — فرض الحدود في الـ Services

**أمثلة على نقاط الفرض:**

```typescript
// في admin.service.ts — createUser()
const usage = await this.billingService.getUsageStats(companyId)
if (usage.users.max && usage.users.current >= usage.users.max) {
  throw new ForbiddenException({
    code: 'PLAN_LIMIT_REACHED',
    message: 'تجاوزت الحد الأقصى للمستخدمين في خطتك الحالية. يرجى الترقية.',
  })
}

// في inventory.service.ts — createProduct()
// نفس المنطق لـ products

// في pos.service.ts — createSale()
// نفس المنطق لـ invoices per month
```

### D.4 Frontend — ربط Billing Page ببيانات حقيقية

**ملف:** `src/app/(billing)/billing/page.tsx` — تعديل

بدلاً من الـ hardcoded data، استدعاء `GET /billing/current` واستخدام البيانات الحقيقية.

---

## 6. المرحلة E — بوابة الدفع

> **الأولوية:** 🟡 متوسطة-عالية | **المدة:** 8-12 ساعة | **التبعيات:** المرحلة D

### E.1 اختيار البوابة

| البوابة | مناسب لـ | تكلفة | ملاحظات |
|---------|----------|-------|---------|
| **Paymob** | مصر + الخليج | 2.5% + 2 ج.م | الأنسب للسوق المصري |
| Fawry | مصر | متغيرة | أكثر انتشاراً محلياً |
| Stripe | عالمي | 2.9% + 30¢ | لا يدعم مصر مباشرة |

> **المقترح:** Paymob كبوابة أساسية + تحويل بنكي يدوي كبديل.

### E.2 Backend — Webhook Endpoint

**ملف جديد:** `apps/backend/src/modules/billing/billing-webhook.controller.ts`

```typescript
@Controller('webhooks')
export class BillingWebhookController {
  // POST /webhooks/payment — Callback من بوابة الدفع
  @Post('payment')
  async handlePaymentWebhook(@Body() body: any, @Headers() headers: Record<string, string>) {
    // 1. التحقق من HMAC signature
    // 2. استخراج transaction status
    // 3. إذا success: تحديث subscription (status='active', تمديد currentPeriodEnd)
    // 4. إنشاء payment invoice record
    // 5. كتابة audit log
  }
}
```

### E.3 Backend — Checkout Flow

**ملف:** `apps/backend/src/modules/billing/billing.controller.ts` — إضافة

```typescript
// POST /billing/checkout — إنشاء payment session
@Post('checkout')
async createCheckout(
  @Headers('x-company-id') companyId: string,
  @Body() body: { planId: string; billingCycle: 'monthly' | 'yearly' | 'lifetime' },
) {
  // 1. جلب Plan + حساب المبلغ
  // 2. إنشاء Paymob payment intention
  // 3. إرجاع { paymentUrl, sessionId }
}
```

### E.4 Database — جدول المدفوعات

**ملف:** `apps/backend/src/common/db/schema.ts` — إضافة

```typescript
export const paymentInvoices = pgTable('payment_invoices', {
  id:              uuid('id').primaryKey().defaultRandom(),
  companyId:       uuid('company_id').notNull().references(() => companies.id),
  subscriptionId:  uuid('subscription_id').references(() => subscriptions.id),
  amount:          numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency:        text('currency').default('EGP'),
  status:          text('status').default('pending'),      // pending, paid, failed, refunded
  gatewayRef:      text('gateway_ref'),                     // Paymob transaction ID
  gatewayResponse: text('gateway_response'),                // JSON
  paidAt:          timestamp('paid_at', { withTimezone: true }),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

### E.5 Frontend — ربط Upgrade Page

**ملف:** `src/app/(billing)/billing/upgrade/page.tsx` — تعديل

عند اختيار خطة → استدعاء `POST /billing/checkout` → redirect لصفحة Paymob.

---

## 7. المرحلة F — تحسينات Super Admin

> **الأولوية:** 🟢 متوسطة | **المدة:** 3-4 ساعات | **التبعيات:** المرحلة D

### F.1 إحصائيات الإيرادات

**ملف:** `apps/backend/src/modules/platform-admin/platform-admin.service.ts` — تحسين `getOverview()`

إضافة:
```typescript
revenue: {
  mrr: number      // Monthly Recurring Revenue
  arr: number      // Annual Recurring Revenue
  thisMonth: number
  lastMonth: number
  growth: number   // نسبة النمو
}
```

### F.2 صفحة الاشتراكات

**ملف جديد:** `src/app/(super-admin)/super-admin/subscriptions/page.tsx`

- قائمة كل الاشتراكات مع فلترة (status, plan, expiry)
- تنبيهات الشركات التي تنتهي تجربتها خلال 3 أيام

### F.3 صفحة الإيرادات

**ملف جديد:** `src/app/(super-admin)/super-admin/billing/page.tsx`

- تقرير شهري بالإيرادات
- مخطط بياني (chart) لتطور الإيرادات
- قائمة المدفوعات الأخيرة

### F.4 تحسين Overview

**ملف:** `src/app/(super-admin)/super-admin/page.tsx` — تعديل

إضافة:
- Card إيرادات الشهر
- تنبيه: "8 شركات تنتهي تجربتها خلال 3 أيام"
- آخر المدفوعات

---

## 8. خريطة الملفات الكاملة

### ملفات جديدة (مطلوب إنشاؤها)

| # | الملف | المرحلة |
|---|-------|---------|
| 1 | `src/app/(dashboard)/dashboard/settings/users/page.tsx` | A |
| 2 | `src/components/settings/UsersManagement.tsx` | A |
| 3 | `apps/backend/src/common/rbac/require-permission.decorator.ts` | B |
| 4 | `apps/backend/src/common/rbac/permission.guard.ts` | B |
| 5 | `src/hooks/use-permissions.ts` | B |
| 6 | `apps/backend/src/modules/billing/billing.controller.ts` | D |
| 7 | `apps/backend/src/modules/billing/billing.service.ts` | D |
| 8 | `apps/backend/src/modules/billing/billing.module.ts` | D |
| 9 | `apps/backend/src/modules/billing/billing-webhook.controller.ts` | E |
| 10 | `src/app/(super-admin)/super-admin/subscriptions/page.tsx` | F |
| 11 | `src/app/(super-admin)/super-admin/billing/page.tsx` | F |
| 12 | `src/components/dashboard/TeamWidget.tsx` | A (اختياري) |

### ملفات موجودة (مطلوب تعديلها)

| # | الملف | المرحلة | نوع التعديل |
|---|-------|---------|-------------|
| 1 | `apps/backend/src/modules/admin/admin.controller.ts` | A+B | 5 endpoints جديدة + Guards |
| 2 | `apps/backend/src/modules/admin/admin.service.ts` | A+C | 5 دوال CRUD + audit helper |
| 3 | `apps/backend/src/common/db/schema.ts` | B+C+E | user_roles + company_audit_logs + payment_invoices |
| 4 | `apps/backend/src/common/rbac/permission-keys.ts` | B | 8 مفاتيح جديدة |
| 5 | `apps/backend/src/common/rbac/policy-evaluator.service.ts` | B | دعم user_roles + fallback |
| 6 | `src/lib/api/admin.ts` | A | 4 methods جديدة |
| 7 | `src/lib/actions/settings.actions.ts` | A | 5 Server Actions |
| 8 | `src/components/settings/SettingsNav.tsx` | A | تاب المستخدمون |
| 9 | `src/components/layout/dashboard-nav-items.ts` | A | رابط المستخدمون |
| 10 | `src/middleware.ts` | B | role check لصفحة users |
| 11 | `src/lib/plan-limits.ts` | D | تفعيل فعلي بدل stubs |
| 12 | `src/app/(billing)/billing/page.tsx` | D | ربط ببيانات حقيقية |
| 13 | `src/app/(dashboard)/dashboard/audit-logs/page.tsx` | C | ربط ببيانات حقيقية |
| 14 | `apps/backend/src/modules/platform-admin/platform-admin.service.ts` | F | إضافة revenue stats |
| 15 | `src/app/(super-admin)/super-admin/page.tsx` | F | إضافة revenue cards |
| 16 | `apps/backend/src/modules/admin/admin.module.ts` | B | إضافة PermissionGuard provider |

---

## 9. تحديثات التوثيق المطلوبة

### بعد كل مرحلة يجب تحديث:

| الملف | ماذا نضيف |
|-------|-----------|
| [`docs/api_contract_v1.md`](../api_contract_v1.md) | الـ endpoints الجديدة + shapes |
| [`docs/api_contract_map.md`](../api_contract_map.md) | ربط Frontend ↔ Backend |
| [`docs/screens_map.md`](../screens_map.md) | الشاشات الجديدة + الصلاحيات المطلوبة |
| [`docs/CONTEXT.md`](../CONTEXT.md) | تحديث Agent outputs |
| [`docs/saas_architecture.md`](../saas_architecture.md) | تحديث بعد بوابة الدفع |

### تحديثات محددة:

**`docs/api_contract_v1.md`:**
```
المرحلة A → إضافة قسم "Admin Users Management" (6 endpoints)
المرحلة C → إضافة "Admin Audit Logs" endpoint
المرحلة D → إضافة قسم "Billing API" (3 endpoints)
المرحلة E → إضافة "Webhooks" section
```

**`docs/api_contract_map.md`:**
```
المرحلة A → إضافة قسم 3.9 (Admin Users) — ✅ تم بالفعل
المرحلة D → إضافة قسم Billing mapping
```

**`docs/screens_map.md`:**
```
المرحلة A → إضافة /settings/users + /settings/roles
المرحلة F → إضافة /super-admin/subscriptions + /super-admin/billing
```

---

## 10. Checklist الكامل

### المرحلة A — إدارة المستخدمين (🔴 أسبوع 1)

- [ ] A.1 DTOs: CreateUserDto + UpdateUserDto + ReasonDto
- [ ] A.2 AdminController: 4 endpoints (POST/PATCH/toggle/reset)
- [ ] A.3 AdminService: createUser()
- [ ] A.4 AdminService: updateUser()
- [ ] A.5 AdminService: toggleUserActive()
- [ ] A.6 AdminService: resetUserPassword()
- [ ] A.7 AdminService: تحسين listUsers() (branchName + lastLoginAt)
- [ ] A.8 Frontend API: adminApi — 4 methods جديدة
- [ ] A.9 Frontend Actions: 5 Server Actions
- [ ] A.10 Frontend Page: `/settings/users/page.tsx`
- [ ] A.11 Frontend Component: `UsersManagement.tsx`
- [ ] A.12 Frontend Nav: تعديل SettingsNav + dashboard-nav-items
- [ ] A.13 اختبار: curl لكل endpoint + متصفح

### المرحلة B — RBAC (🔴 أسبوع 1)

- [ ] B.1 Schema: إضافة جدول user_roles
- [ ] B.2 Migration: drizzle-kit generate + push
- [ ] B.3 Permission Keys: توسيع لـ 21 مفتاح
- [ ] B.4 RequirePermission decorator (ملف جديد)
- [ ] B.5 PermissionGuard (ملف جديد)
- [ ] B.6 تحديث PolicyEvaluator (دعم user_roles)
- [ ] B.7 تطبيق Guard على admin endpoints
- [ ] B.8 Middleware: حماية /settings/users
- [ ] B.9 Frontend: usePermissions hook
- [ ] B.10 AdminModule: تسجيل PermissionGuard + PolicyEvaluator
- [ ] B.11 اختبار: endpoint محمي يرفض cashier

### المرحلة C — Audit Logs (🟡 أسبوع 1)

- [ ] C.1 Schema: إضافة جدول company_audit_logs
- [ ] C.2 Migration: generate + push
- [ ] C.3 AdminService: writeAuditLog() helper
- [ ] C.4 ربط audit بكل عملية CRUD users
- [ ] C.5 AdminController: تفعيل GET /admin/audit-logs
- [ ] C.6 AdminService: listAuditLogs()
- [ ] C.7 Frontend: ربط /audit-logs ببيانات حقيقية
- [ ] C.8 اختبار: إضافة مستخدم → تحقق من ظهور log

### المرحلة D — الاشتراكات (🟡 أسبوع 2)

- [ ] D.1 BillingModule + Controller + Service (3 ملفات جديدة)
- [ ] D.2 GET /billing/current endpoint
- [ ] D.3 GET /billing/usage endpoint
- [ ] D.4 تفعيل plan-limits.ts (بيانات حقيقية)
- [ ] D.5 فرض الحدود في AdminService (users)
- [ ] D.6 فرض الحدود في InventoryService (products)
- [ ] D.7 فرض الحدود في POSService (invoices/month)
- [ ] D.8 Frontend: ربط /billing ببيانات حقيقية
- [ ] D.9 تنبيه في الداشبورد عند اقتراب الحد
- [ ] D.10 اختبار: تجاوز الحد → رسالة خطأ مناسبة

### المرحلة E — بوابة الدفع (🟡 أسبوع 2-3)

- [ ] E.1 اختيار بوابة الدفع (Paymob)
- [ ] E.2 Schema: جدول payment_invoices
- [ ] E.3 Migration: generate + push
- [ ] E.4 POST /billing/checkout endpoint
- [ ] E.5 POST /webhooks/payment endpoint
- [ ] E.6 تحديث subscription عند نجاح الدفع
- [ ] E.7 إنشاء payment invoice record
- [ ] E.8 Frontend: ربط /billing/upgrade بالدفع
- [ ] E.9 Frontend: ربط /billing/history بالمدفوعات
- [ ] E.10 اختبار: دورة دفع كاملة (sandbox)

### المرحلة F — تحسينات Super Admin (🟢 أسبوع 3)

- [ ] F.1 Backend: إضافة revenue stats في overview
- [ ] F.2 Frontend: صفحة /super-admin/subscriptions
- [ ] F.3 Frontend: صفحة /super-admin/billing
- [ ] F.4 Frontend: تحسين overview (revenue + alerts)
- [ ] F.5 تنبيهات الشركات المنتهية

### التوثيق (بعد كل مرحلة)

- [ ] تحديث `docs/api_contract_v1.md`
- [ ] تحديث `docs/api_contract_map.md`
- [ ] تحديث `docs/screens_map.md`
- [ ] تحديث `docs/CONTEXT.md`
- [ ] تحديث `docs/saas_architecture.md` (بعد المرحلة E)

---

## الجدول الزمني المقترح

```
الأسبوع 1 (الأيام 1-3):
  ├── المرحلة A — إدارة المستخدمين (Backend + Frontend)
  ├── المرحلة B — RBAC (Guard + Decorator + PolicyEvaluator)
  └── المرحلة C — Audit Logs

الأسبوع 2 (الأيام 4-6):
  ├── المرحلة D — تفعيل الاشتراكات
  └── المرحلة E — بوابة الدفع (بداية)

الأسبوع 3 (الأيام 7-9):
  ├── المرحلة E — بوابة الدفع (اكتمال + اختبار)
  ├── المرحلة F — تحسينات Super Admin
  └── التوثيق النهائي + اختبار شامل
```

---

## API Contract الكامل (Cheat Sheet)

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

## المراجع

| الملف | الوصف |
|-------|-------|
| [`USER_MANAGEMENT_MASTER_PLAN.md`](./USER_MANAGEMENT_MASTER_PLAN.md) | الخطة السابقة لإدارة المستخدمين (مرجع تفصيلي) |
| [`api_contract_v1.md`](../api_contract_v1.md) | عقد الـ APIs الرسمي |
| [`api_contract_map.md`](../api_contract_map.md) | خريطة ربط Frontend ↔ Backend |
| [`screens_map.md`](../screens_map.md) | خريطة الشاشات والصلاحيات |
| [`CONTEXT.md`](../CONTEXT.md) | سياق المشروع العام |
| [`saas_architecture.md`](../saas_architecture.md) | معمارية SaaS |
| [`pos_project_brief_and_prd.md`](../pos_project_brief_and_prd.md) | وثيقة المتطلبات الأصلية |
| [`.agents/agent-13-backend-general.md`](../../.agents/agent-13-backend-general.md) | تعليمات Backend Agent |
