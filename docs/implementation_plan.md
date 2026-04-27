# خطة إدارة المستخدمين والصلاحيات + داشبورد الأدمن

## 📊 تحليل الوضع الحالي

### ✅ ما تم إنجازه (موجود وشغال)

| المكون | الحالة | ملاحظات |
|--------|--------|---------|
| **تسجيل/دخول/خروج** | ✅ مكتمل | JWT + cookies + refresh token |
| **Tenant Middleware** | ✅ مكتمل | استخراج companyId/userId من JWT |
| **Platform Admin Dashboard** | ✅ أساسي | overview, companies, users, audit-logs, org-units, RBAC |
| **Platform Admin Guard** | ✅ مكتمل | يتحقق من `role === 'platform_admin'` |
| **DB Schema (RBAC)** | ✅ مكتمل | roles, role_permissions, user_permission_overrides, org_units |
| **Policy Evaluator** | ✅ أساسي | getEffectivePermissions (role perms + user overrides) |
| **Permission Keys** | ✅ أساسي | 13 مفتاح صلاحية معرّف |
| **Admin API (على مستوى الشركة)** | ⚠️ جزئي | listUsers فقط (قراءة)، بدون CRUD كامل |

### ❌ الفجوات والنواقص المكتشفة

#### 1. إدارة المستخدمين على مستوى الشركة (Company-Level User Management)

> [!CAUTION]
> **لا توجد صفحة فرونت إند لإدارة المستخدمين داخل الداشبورد العادي.**
> - الإعدادات الحالية (`/dashboard/settings/`) تحتوي: الشركة، الفروع، المخازن، المتغيرات، الفاتورة، الطباعة
> - **لا يوجد تاب "المستخدمون"** في الإعدادات
> - لا توجد صفحة لإضافة/تعديل/حذف مستخدمين للشركة
> - لا يوجد رابط "المستخدمون" في قائمة التنقل الجانبية

#### 2. Backend APIs الناقصة (Company-Level)

- `POST /admin/users` — إنشاء مستخدم جديد للشركة ❌ غير موجود
- `PATCH /admin/users/:id` — تعديل بيانات المستخدم (الدور، الحالة، الفرع) ❌ غير موجود
- `DELETE /admin/users/:id` — حذف/تعطيل مستخدم ❌ غير موجود
- `POST /admin/users/:id/reset-password` — إعادة تعيين كلمة المرور ❌ غير موجود
- `POST /admin/roles` — إنشاء دور جديد ❌ غير موجود
- `GET /admin/roles` — عرض أدوار الشركة ❌ غير موجود
- `PATCH /admin/roles/:id` — تعديل صلاحيات الدور ❌ غير موجود

#### 3. ربط المستخدم بالدور (User-Role Assignment)

> [!IMPORTANT]
> **حالياً** الدور محفوظ كنص حر في `profiles.role` (admin/manager/cashier/viewer) — **لا يوجد ربط فعلي** بجدول `roles`.
> - جدول `roles` موجود في DB لكن **لا يُستخدم** لتحديد دور المستخدم
> - `PolicyEvaluator` يجلب صلاحيات كل أدوار الشركة (بدون ربط بمستخدم محدد)
> - **لا يوجد جدول `user_roles`** لربط المستخدم بدور أو أكثر

#### 4. فرض الصلاحيات (Permission Enforcement)

> [!WARNING]
> `PolicyEvaluator` موجود لكن **غير مُفعّل** في أي Controller أو Guard.
> - لا يوجد `@RequirePermission('inventory.write')` decorator
> - لا يوجد Guard يتحقق من الصلاحيات الفعلية قبل تنفيذ العمليات
> - الوحيد المُفعّل هو `PlatformAdminGuard` (يتحقق من role === platform_admin فقط)

#### 5. داشبورد الأدمن (Company Dashboard)

- الداشبورد الرئيسي (`/dashboard`) يعرض KPIs + مبيعات + مخزون ✅
- **لا يوجد** قسم "إدارة الفريق" أو "المستخدمون" في الداشبورد
- **لا يوجد** عرض سريع لعدد المستخدمين والأدوار

#### 6. Audit Logs على مستوى الشركة

- صفحة `/dashboard/audit-logs` موجودة لكن البيانات **فارغة دائماً** (endpoint يرجع `[]`)
- لا يوجد نظام audit log على مستوى الشركة (الموجود فقط platform-level)

---

## 🛠️ خطة التنفيذ (5 مراحل)

---

### المرحلة 1: إدارة المستخدمين على مستوى الشركة (Backend APIs)
**الأولوية: 🔴 عالية جداً | المدة التقديرية: 3-4 ساعات**

#### [MODIFY] [admin.controller.ts](file:///home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/modules/admin/admin.controller.ts)
إضافة endpoints جديدة:
- `POST /admin/users` — إنشاء مستخدم جديد (بريد + كلمة مرور + اسم + دور + فرع)
- `PATCH /admin/users/:id` — تعديل (الاسم, الدور, الفرع, الحالة isActive)
- `DELETE /admin/users/:id` — تعطيل المستخدم (soft delete = isActive: false)
- `POST /admin/users/:id/reset-password` — إعادة تعيين كلمة مرور مؤقتة

#### [MODIFY] [admin.service.ts](file:///home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/modules/admin/admin.service.ts)
- `createUser(companyId, data)` — إدراج في users + profiles مع ربط الشركة والفرع
- `updateUser(companyId, userId, patch)` — تحديث البروفايل مع التحقق من tenant isolation
- `disableUser(companyId, userId)` — تعطيل (isActive = false)
- `resetPassword(companyId, userId)` — إنشاء كلمة مرور مؤقتة
- تحسين `listUsers` لإرجاع اسم الفرع والدور

#### [MODIFY] [admin.ts (API adapter)](file:///home/eldrwal/Desktop/Pos-Sahl/src/lib/api/admin.ts)
إضافة methods في `adminApi`:
- `createUser`, `updateUser`, `deleteUser`, `resetPassword`

---

### المرحلة 2: صفحة إدارة المستخدمين بالفرونت إند
**الأولوية: 🔴 عالية جداً | المدة التقديرية: 4-5 ساعات**

#### [NEW] `/dashboard/settings/users/page.tsx`
صفحة إدارة المستخدمين تتضمن:
- جدول بكل مستخدمي الشركة (الاسم، البريد، الدور، الفرع، الحالة)
- زر "إضافة مستخدم" يفتح dialog
- أزرار أكشن (تعديل، تعطيل/تفعيل، إعادة تعيين كلمة المرور)
- فلترة بالبحث والدور والحالة

#### [NEW] `src/components/settings/UsersManagement.tsx`
كومبوننت Client-Side يحتوي:
- `UserFormDialog` — فورم إضافة/تعديل المستخدم (الاسم، البريد، كلمة المرور، الدور، الفرع)
- `UserActions` — أزرار العمليات (تعطيل/تفعيل + reset password + تعديل الدور)
- Select للدور (owner, admin, manager, cashier, viewer)
- Select للفرع (من قائمة فروع الشركة)

#### [MODIFY] [SettingsNav.tsx](file:///home/eldrwal/Desktop/Pos-Sahl/src/components/settings/SettingsNav.tsx)
إضافة تاب "المستخدمون" مع أيقونة `Users`:
```tsx
{ title: "المستخدمون", href: "/dashboard/settings/users", icon: Users },
```

#### [MODIFY] [dashboard-nav-items.ts](file:///home/eldrwal/Desktop/Pos-Sahl/src/components/layout/dashboard-nav-items.ts)
إضافة رابط مباشر "المستخدمون" في section "النظام":
```tsx
{ icon: Users, label: "المستخدمون", href: "/dashboard/settings/users" },
```

---

### المرحلة 3: نظام الأدوار والصلاحيات على مستوى الشركة
**الأولوية: 🟡 متوسطة-عالية | المدة التقديرية: 3-4 ساعات**

#### [NEW] `user_roles` table (DB Migration)
إنشاء جدول ربط المستخدم بالدور:
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

#### [MODIFY] [schema.ts](file:///home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/common/db/schema.ts)
إضافة:
- `userRoles` table definition
- Relations بين users/profiles و roles

#### [MODIFY] [admin.controller.ts](file:///home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/modules/admin/admin.controller.ts)
إضافة endpoints للأدوار:
- `GET /admin/roles` — عرض أدوار الشركة
- `POST /admin/roles` — إنشاء دور جديد
- `PATCH /admin/roles/:id` — تعديل صلاحيات الدور
- `DELETE /admin/roles/:id` — حذف الدور (مع حماية system roles)
- `POST /admin/users/:id/roles` — تعيين دور للمستخدم

#### [MODIFY] [policy-evaluator.service.ts](file:///home/eldrwal/Desktop/Pos-Sahl/apps/backend/src/common/rbac/policy-evaluator.service.ts)
تحديث `getEffectivePermissions` ليستخدم:
1. أدوار المستخدم من `user_roles` (بدلاً من كل أدوار الشركة)
2. صلاحيات الدور من `role_permissions`
3. User overrides كالحالي

#### [NEW] `PermissionGuard` / `@RequirePermission()` Decorator
- Guard يتحقق من الصلاحيات الفعلية قبل تنفيذ أي endpoint
- Decorator لتحديد الصلاحية المطلوبة على كل endpoint

---

### المرحلة 4: تحسين داشبورد الأدمن على مستوى الشركة
**الأولوية: 🟡 متوسطة | المدة التقديرية: 2-3 ساعات**

#### [MODIFY] [dashboard page.tsx](file:///home/eldrwal/Desktop/Pos-Sahl/src/app/(dashboard)/dashboard/page.tsx)
إضافة widget "الفريق" في الداشبورد الرئيسي:
- عدد المستخدمين النشطين / الإجمالي
- آخر مستخدم تم إضافته
- رابط مختصر لصفحة المستخدمين

#### [MODIFY] Admin Backend — إنشاء Audit Log على مستوى الشركة
- `POST /admin/users` → يكتب audit log
- `PATCH /admin/users/:id` → يكتب audit log
- `POST /admin/users/:id/reset-password` → يكتب audit log
- كل عملية حساسة تُسجّل

#### [MODIFY] [audit-logs page.tsx](file:///home/eldrwal/Desktop/Pos-Sahl/src/app/(dashboard)/dashboard/audit-logs/page.tsx)
ربط صفحة سجل النشاطات ببيانات حقيقية (بدلاً من `[]`):
- إنشاء جدول `company_audit_logs` (مشابه لـ `platform_audit_logs` لكن على مستوى الشركة)
- عرض سجل العمليات المهمة

---

### المرحلة 5: تحسينات أمنية وتشغيلية
**الأولوية: 🟢 متوسطة | المدة التقديرية: 2-3 ساعات**

#### تحسين Middleware الأمان
- إضافة التحقق من `isActive` في tenant middleware (منع المستخدمين المعطّلين من الوصول)
- التحقق من انتهاء صلاحية الشركة/الاشتراك في middleware

#### إزالة الاعتماد على `x-company-id` Header
- التأكد من أن كل endpoints تستخدم companyId من JWT فقط
- إزالة fallback على `x-company-id` في production

#### تحسين Permission Keys
إضافة صلاحيات جديدة:
```typescript
'admin.users.read',      // عرض المستخدمين
'admin.users.manage',    // إضافة/تعديل/حذف (موجود)
'admin.roles.manage',    // إدارة الأدوار
'admin.audit.read',      // عرض سجل النشاطات
'contacts.read',         // عرض العملاء والموردين
'contacts.write',        // تعديل العملاء والموردين
```

---

## ⚠️ مراجعة مطلوبة

> [!IMPORTANT]
> **قرارات تصميمية تحتاج موافقتك:**
> 1. **هل نحتاج جدول `user_roles` فوراً؟** أم نكتفي بإبقاء `profiles.role` كنص حالياً مع إضافة واجهة تعديله؟
> 2. **هل نُفعّل فرض الصلاحيات (PermissionGuard)** على كل endpoints الآن أم نؤجلها لمرحلة لاحقة؟
> 3. **هل الـ Company Audit Logs** أولوية عالية (تنقل للمرحلة 1-2) أم تبقى في المرحلة 4؟

---

## 🧪 خطة التحقق

### اختبارات محلية
- `npm run backend:build` — التأكد من Build ناجح بعد كل مرحلة
- Smoke test: `GET /admin/users` + `POST /admin/users` + `PATCH /admin/users/:id`
- التحقق من tenant isolation (مستخدم شركة A لا يرى مستخدمي شركة B)

### اختبارات المتصفح
- تسجيل دخول كـ owner → التنقل إلى الإعدادات → المستخدمون
- إضافة مستخدم جديد → تأكيد ظهوره في الجدول
- تعطيل/تفعيل مستخدم → تأكيد تغير الحالة
- إعادة تعيين كلمة المرور → تأكيد ظهور الكلمة المؤقتة

---

## 📋 ترتيب التنفيذ المقترح

| الخطوة | المرحلة | المدة |
|--------|---------|-------|
| 1 | المرحلة 1: Backend APIs لإدارة المستخدمين | 3-4 ساعات |
| 2 | المرحلة 2: صفحة الفرونت إند + SettingsNav | 4-5 ساعات |
| 3 | المرحلة 4: تحسين الداشبورد + Audit Logs | 2-3 ساعات |
| 4 | المرحلة 3: نظام الأدوار (اختياري حسب القرار) | 3-4 ساعات |
| 5 | المرحلة 5: تحسينات أمنية | 2-3 ساعات |
