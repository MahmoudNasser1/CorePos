# System-level RBAC + Ops Safety Plan (Parallel)

## الهدف
تنفيذ التغييرات البنيوية المطلوبة لدعم:
- RBAC موحد (Role templates + User overrides) عبر المنصة
- Guards/Policies على مستوى الـ Backend
- Audit logging موحد
- Impersonation آمن
- Data repair (recompute) كـ jobs قابلة للتتبع

هذا الملف يُنفّذ **بالتوازي** مع خطة واجهة `/super-admin/**` المذكورة في:
- `.cursor/plans/platform_admin_dashboard_05fef2e3.plan.md`

---

## 1) RBAC Model (Source of Truth)

### 1.1 Permission keys (Matrix)
تعريف مجموعة مفاتيح ثابتة تُستخدم في UI/Backend/Audit، مثال:
- `inventory.read`, `inventory.write`
- `sales.read`, `sales.write`
- `finance.read`, `finance.write`
- `reports.read`, `reports.view_costs`
- `admin.users.manage`, `admin.settings.manage`
- `platform.companies.manage`, `platform.users.manage`, `platform.ops.execute`

> القاعدة: لا نستخدم strings “حرة” في الكود. كل شيء يُدار عبر enum/const واحد.

### 1.2 Role templates
لكل شركة: مجموعة Roles قياسية (Owner/Manager/Cashier/Viewer) + إمكانية إضافة Role مخصص.

### 1.3 User overrides
استثناءات per user (grant/deny) فوق role template، مع:
- سبب/ملاحظة
- تاريخ إنشاء/مُنشئ
- Audit log

---

## 2) Database / Migrations
إنشاء/توسعة جداول تدعم RBAC وعمليات الـ Ops بشكل آمن:

- `roles(id, company_id, name, is_system, created_at)`
- `role_permissions(role_id, permission_key)` (أو JSONB permissions مع تحقق)
- `user_role_assignments(user_id, company_id, role_id, created_at)`
- `user_permission_overrides(user_id, company_id, permission_key, effect, reason, created_at)`
- `platform_audit_logs(...)` (إن لم يكن موجوداً)
- (اختياري للـ Ops) `user_security(user_id, token_version, failed_attempts, locked_until, last_login_at, updated_at)`

قرار تصميم:
- الأفضل غالباً: جداول علاقة واضحة (بدل JSON) لتسهيل التحقيق والتدقيق والتصفية.

---

## 3) Backend Guards / Policy enforcement

### 3.1 Policy evaluator موحد
طبقة واحدة لحساب “هل المستخدم مسموح له؟” بناءً على:
- role template
- overrides
- platform role (`platform_admin`)

### 3.2 Enforcement points
- Controllers/Services الحساسة تستخدم guard/policy قبل تنفيذ أي تعديل.
- أي endpoint Platform-level يتحقق من `role === platform_admin` + (اختياري) permission `platform.ops.execute`.

### 3.3 Production rules
- منع الاعتماد على `x-company-id` في production بالكامل (يبقى dev-only).
- كل “اختيار شركة” في Platform Admin يتم عبر query param/route param مع تحقق صريح.

---

## 4) Audit logging (Platform + Company)

### 4.1 Contract موحد
كل action يكتب سجل يحتوي:
- `actor_user_id`
- `company_id` (اختياري)
- `action` (string ثابت/enum)
- `target_type`, `target_id`
- `old`, `new` (مختصر/آمن)
- `ip`, `request_id`
- `created_at`

### 4.2 Mandatory coverage
- كل Ops action
- كل تغيير roles/permissions/overrides
- كل تغيير subscription/plan/feature flags

---

## 5) Impersonation (High-risk feature)

### 5.1 Requirements
- **TTL قصير جداً** (مثلاً 10–20 دقيقة)
- Banner واضح في UI: “أنت منتحل حساب …”
- زر “إنهاء الانتحال” في كل صفحات `/dashboard` و`/super-admin`
- Audit log عند بدء/إنهاء الانتحال

### 5.2 Implementation strategy
- Token/session خاصة بالانتحال تحتوي:
  - `impersonatorUserId`
  - `impersonatedUserId`
  - `impersonationSessionId`
  - `expiresAt`
- Guards تمنع استخدام الانتحال لتنفيذ أفعال platform-admin مباشرة (تقليل إساءة الاستخدام).

---

## 6) Data repair / recompute (High-risk feature)

### 6.1 Jobs not inline
أي recompute يتم عبر Job queue:
- إنشاء job record
- تشغيل worker
- progress/status
- إمكانية cancel (اختياري)
- Audit log لبدء job ونتيجته

### 6.2 Safety
- reason إلزامي
- rate limit per company
- منع التشغيل المتزامن لنفس الشركة لنفس job type

---

## 7) Tests / Acceptance
- وحدات policy evaluator (role + override + platform_admin)
- تكامل: endpoint محمي يرفض بدون permission
- تدقيق: كل action يكتب audit log
- impersonation: TTL + banner + end flow يعمل
- recompute: job lifecycle + منع التزامن

---

## 8) Optional Phase 2 (Controlled rollout)

### 8.1 Feature flags
إضافة flags لتفعيل وحدات خطرة/متقدمة تدريجيًا:
- `impersonation`
- `data_repair`
- `observability`
- `advanced_audit_export`

### 8.2 Break-glass access
آلية “طوارئ” تمنح صلاحية مؤقتة للـ platform_admin:
- TTL قصير + reason إلزامي
- audit log عند البدء/الانتهاء
- لا تُستخدم إلا عند الحاجة (بديل عن فتح صلاحيات خطرة بشكل دائم)

### 8.3 Export/Compliance
توحيد تصدير البيانات الحساسة:
- audit logs export (CSV/Excel) مع احترام الفلاتر والحدود
- users/roles/permissions export (CSV/Excel) للتدقيق

---

## مخرجات هذا الملف (Deliverables)
- Migrations + schema updates
- RBAC policy evaluator + guards
- Audit logging infrastructure
- Impersonation flow (backend + frontend hooks/banner)
- Jobs infrastructure للـ recompute

