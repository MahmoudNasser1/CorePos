# 🛡️ Agent 12 — Platform Admin (Super Admin) + RBAC + Ops + KPIs Engineer
**المشروع:** CorePOS | **المسار:** `/super-admin/**` | **يعتمد على:** Agent-02 + Agent-07 + Agent-06 + Agent-03  
**الهدف:** بناء قسم إدارة منصة كامل (Platform Admin) يشمل إدارة المستخدمين/إداراتهم/صلاحياتهم + أدوات إصلاح آمنة + KPIs وتقارير.

---

## 🎯 مهمتك الأساسية
أنت مسؤول تنفيذ **Section الإدارة للمنصة** بحيث يتيح لـ `platform_admin`:
- **إدارة الشركات**: عرض/بحث/فلترة + إجراءات (تغيير plan، تمديد trial، تعطيل/تفعيل).
- **إدارة المستخدمين** عبر كل الشركات: بحث/فلترة + إدارة أدوار وصلاحيات + قفل/فتح/تسجيل خروج إجباري/Reset.
- **الإدارات (Org Units) + صلاحيات Modules (RBAC)**:
  - Departments/Org Units داخل الشركات وربط المستخدمين بها.
  - Permission Matrix ثابتة + Role templates + User overrides.
- **Ops / Troubleshooting** (آمن ومقيد):
  - force logout / unlock / reset password
  - feature flags
  - subscription fixes
  - impersonation (بوابات أمان قوية)
  - data repair / recompute كـ jobs
- **KPIs & Reports**: Users/Access + Finance/Sales + Inventory/Ops + System health + Audit/Compliance.

---

## 🛠️ الـ Skills المطلوبة
```text
@senior-fullstack
@backend-security-coder
@security-auditor
@database-design
@postgres-best-practices
@api-design-principles
@nextjs-best-practices
@react-patterns
@tanstack-query-expert
@zod-validation-expert
@accessibility-compliance-accessibility-audit
@ui-review
```

---

## 📋 اقرأ أولاً (إلزامي)
1) `.agents/agent-02-auth-saas.md`  
2) `.agents/agent-06-reports-admin.md`  
3) `.agents/agent-07-backend-migration.md`  
4) `src/middleware.ts` (حماية `/super-admin/**`)  
5) `apps/backend/src/modules/admin/admin.controller.ts` (الحالي company-level)  
6) `apps/backend/src/common/tenant/tenant.middleware.ts` (tenant context)  
7) `docs/plans/system_rbac_ops_plan.md` (خطة السيستم الموازية)  
8) `.cursor/plans/platform_admin_dashboard_05fef2e3.plan.md` (الخطة الأم)  

---

## 🧭 نطاق التنفيذ (مهم)
- هذا Agent يبني **Platform Admin** فقط. لا يكسر أي UI موجود.
- كل عمليات Ops الخطرة لازم تكون وراء بوابات أمان + audit logging.
- لا تعتمد على `x-company-id` في production.

---

## 🧱 منهج التنفيذ (ملزم)
نفّذ على شكل **Vertical slices**:
- Slice 1: حماية المسارات + Overview KPI + endpoint backend للـ overview.
- Slice 2: Companies list + details + actions (trial/plan/disable).
- Slice 3: Users list + actions (unlock/reset/force logout) + RBAC UI skeleton.
- Slice 4: Org Units CRUD + ربط المستخدمين.
- Slice 5: RBAC role templates + overrides + policy evaluator + guards.
- Slice 6: Audit logs + exports.
- Slice 7: Impersonation + banner + TTL + end flow (بوابات قوية).
- Slice 8: Data repair jobs + monitoring.

بعد كل slice:
- تحديث `docs/agent_reports/PROGRESS.md`
- توثيق أي مخاطرة في `docs/agent_reports/RISKS.md`
- كتابة Handoff لو احتجت Agent آخر في `docs/agent_reports/HANDOFFS.md`

---

## 📌 مهام تفصيلية (Frontend)

### A) Routes
- `src/app/(super-admin)/super-admin/page.tsx` (Overview)
- `src/app/(super-admin)/super-admin/companies/page.tsx`
- `src/app/(super-admin)/super-admin/companies/[id]/page.tsx`
- `src/app/(super-admin)/super-admin/users/page.tsx`
- `src/app/(super-admin)/super-admin/org/page.tsx`
- `src/app/(super-admin)/super-admin/audit-logs/page.tsx`
- `src/app/(super-admin)/super-admin/health/page.tsx`
- `src/app/(super-admin)/super-admin/reports/page.tsx`

### B) Shared UI patterns
- استخدام `DataTable`, `PageHeader`, `StatCard`, `CurrencyDisplay`
- فلاتر موحدة + Empty states عربية + RTL
- كل الأزرار destructive لازم Confirmation dialog
- **لا placeholders مضللة** (لا أرقام وهمية)

### C) Adapter/API
- `src/lib/api/platform-admin.ts`
- `src/lib/actions/platform-admin.actions.ts`

---

## 📌 مهام تفصيلية (Backend)

### D) Module جديد
- `apps/backend/src/modules/platform-admin/**`
- Guard: `PlatformAdminGuard` (role === platform_admin)
- Endpoints (MVP):
  - `/v1/platform-admin/overview`
  - `/v1/platform-admin/companies` (+ filters)
  - `/v1/platform-admin/companies/:id` (+ actions)
  - `/v1/platform-admin/users` (+ filters)
  - `/v1/platform-admin/users/:id` (patch)
  - `/v1/platform-admin/users/:id/force-logout`
  - `/v1/platform-admin/users/:id/reset-password`
  - `/v1/platform-admin/users/:id/unlock`
  - `/v1/platform-admin/org-units` (CRUD)
  - `/v1/platform-admin/rbac` (get/patch)
  - `/v1/platform-admin/audit-logs`

### E) Ops actions (أمان)
- **reason إلزامي** للأفعال الخطرة
- Audit log تفصيلي + requestId + ip
- Rate limiting
- Impersonation TTL + banner + end flow
- recompute كـ jobs (Queue/worker) وعدم التنفيذ inline

---

## 📊 KPIs/Reports المطلوبة (قائمة أولية)
- Users/Access: active users، disabled users، failed login attempts (إن وجدت)، role changes
- Finance/Sales: revenue، profit، invoices count، returns
- Inventory/Ops: low stock count، top moving products (إن متاح)
- System health: 5xx count، avg latency، slow endpoints (حسب البيانات المتاحة)
- Audit/Compliance: عدد actions الحساسة + export logs

---

## ✅ Deliverables
- D1: صفحات `/super-admin/**` تعمل + RTL + Empty states عربية
- D2: Backend `platform-admin` module + guard + endpoints
- D3: RBAC foundations (templates + overrides + permission keys) وفق `docs/plans/system_rbac_ops_plan.md`
- D4: Audit logs موحد + Export (Phase 2 optional)
- D5: Impersonation + Data repair jobs (Phase 2/بوابات أمان)

---

## ⚠️ قواعد صارمة
1. ممنوع أي عملية خطرة بدون **audit log**.
2. ممنوع impersonation بدون TTL + banner + زر إنهاء + reason إلزامي.
3. ممنوع data repair inline — لازم Jobs.
4. لا تعتمد على `x-company-id` في production.
5. لا تغيّر business logic في الـ POS/Finance أثناء بناء admin.
6. لا تضيف dependencies إلا للضرورة وبمبرر مكتوب في `RISKS.md`.

---

## 🧪 Acceptance (Minimum)
- `platform_admin` فقط يفتح `/super-admin/**`
- Overview + Companies + Users شغالين end-to-end
- كل فعل إداري يسجل audit log
- لا بيانات وهمية مضللة في الواجهة

