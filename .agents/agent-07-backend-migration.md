# ⚙️ Agent 07 — Backend Migration & Integration Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Gate 2 (وبتنسيق مع 04/05/06)

---

## 🎯 مهمتك الأساسية

أنت كبير مهندسي البنية التحتية لحلّ نظام الـ Backend. مهمتك بناء Backend مستقل مبني بـ TypeScript (NestJS) مع بناء طبقة `Adapter` في الفرونت تدريجياً لضمان عدم توقف النظام للحظة واحدة.

**الهدف النهائي:**
- الحفاظ على نفس سلوك النظام التجاري والمالي
- ربط الفرونت الحالي مع Backend جديد
- توحيد الاعتماد التشغيلي على Backend واحد في مسارات الـ MVP

---

## 🛠️ الـ Skills المطلوبة

```
@senior-fullstack
@architect-review
@nextjs-best-practices
@systematic-debugging
@database-design
@security-auditor
@concise-planning
```

---

## 📋 اقرأ أولاً (إلزامي)

1) `/home/eldrwal/Desktop/Pos-Sahl/docs/CONTEXT.md`  
2) `/home/eldrwal/Desktop/Pos-Sahl/docs/decisions.md`  
3) `/home/eldrwal/Desktop/Pos-Sahl/docs/pos_project_brief_and_prd.md`  
4) `/home/eldrwal/Desktop/Pos-Sahl/docs/saas_architecture.md`  
5) `/home/eldrwal/Desktop/Pos-Sahl/docs/CODING_STANDARDS.md`  
6) `/home/eldrwal/Desktop/Pos-Sahl/docs/database_schema.sql`  
7) `/home/eldrwal/Desktop/Pos-Sahl/docs/saas_layer_schema.sql`  
8) `/home/eldrwal/Desktop/Pos-Sahl/src/lib/api/**`  
9) `/home/eldrwal/Desktop/Pos-Sahl/src/lib/actions/**`  
10) `/home/eldrwal/Desktop/Pos-Sahl/src/middleware.ts`  

---

## 🧱 الـ Stack المستهدف للباك إند الجديد

- **Framework:** NestJS (TypeScript strict)
- **Database:** PostgreSQL + Drizzle ORM (لأمان الأنواع العالي والـ Transactions)
- **Cache/Queue:** Redis
- **Storage:** S3-compatible (MinIO)
- **Auth:** JWT (Access + Refresh) عبر HttpOnly Cookies
- **Realtime:** WebSocket Gateway
- **API Contract:** REST + OpenAPI
- **Multi-Tenancy Enforcer:** `AsyncLocalStorage (ALS)` لحقن الـ `company_id` عالمياً في كل Queries الـ Drizzle.
- **Workspace:** إعداد Monorepo (باستخدام npm workspaces أو Turborepo) لمشاركة الـ Types بين الـ Frontend والـ Backend.

---

## 🗺️ مراحل التنفيذ التفصيلية

### Phase 1 — Backend Foundation
- [ ] إنشاء backend app داخل المشروع (مثل `apps/backend`)
- [ ] إعداد config + validation + logging + error format موحد
- [ ] إعداد docker-compose (postgres, redis, minio)
- [ ] إضافة health/readiness endpoints

### Phase 2 — Auth + Tenant Context
- [ ] تنفيذ register/login/logout/refresh/reset
- [ ] بناء AuthGuard + RolesGuard + TenantGuard
- [ ] endpoint موحد للجلسة: `user + profile + company + subscription`
- [ ] مطابقة منطق الحماية الموجود في `src/middleware.ts`

### Phase 3 — Master Data APIs
- [ ] APIs للفروع، المخازن، الأصناف، العملاء، الموردين، الفئات
- [ ] رفع صور الأصناف على MinIO + signed URLs
- [ ] تنفيذ plan limits على السيرفر

### Phase 4 — Financial Transaction Engine
- [ ] تنفيذ create sale/purchase/returns/payments بشكل atomic transaction
- [ ] الحفاظ على `YYMM-NNN` في أرقام الفواتير
- [ ] نفس سلوك تحديث المخزون/الخزينة/الأرصدة الحالي

### Phase 5 — Reports + Billing + Super Admin
- [ ] APIs التقارير الأساسية (daily, sales, profits, stock, treasury)
- [ ] Billing manual workflow (MVP)
- [ ] Super Admin APIs + audit logs

### Phase 6 — Frontend Adapter Migration
- [ ] إنشاء طبقة Adapter في الفرونت (`src/lib/api/*`)
- [ ] استبدال الاستدعاءات القديمة تدريجياً بدون تغيير UX
- [ ] Feature flags للتحويل endpoint-by-endpoint

### Phase 7 — Cutover
- [ ] إتمام test plan شامل لمسارات MVP
- [ ] إزالة الاعتماد على أي مصدر قديم من المسارات المحوّلة
- [ ] توثيق checklist الإغلاق النهائي

---

## 🔁 أسلوب التنفيذ المطلوب

لكل Phase:
1. نفّذ الحد الأدنى القابل للتشغيل (Vertical slice).
2. اختبر محلياً.
3. اعرض تقرير حالة قصير:
   - ما تم
   - ما لم يتم
   - المخاطر
   - أوامر التحقق
4. انتظر موافقة قبل الانتقال للمرحلة التالية.

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف/المجلد | الوصف |
|---|-------------|-------|
| D1 | `apps/backend/` | تطبيق الباك إند الكامل |
| D2 | `apps/backend/src/modules/**` | Modules حسب الدومين |
| D3 | `apps/backend/src/common/**` | Guards, filters, interceptors, config |
| D4 | `apps/backend/db/migrations/**` | Migrations متسلسلة |
| D5 | `apps/backend/openapi.json` | Contract API موثق |
| D6 | `src/lib/api/**` | Adapter layer للفرونت |
| D7 | `src/lib/api/**` | طبقة adapters للباك إند |
| D8 | `docs/backend_migration_plan.md` | خطة التنفيذ وحالة كل مرحلة |
| D9 | `docs/backend_env.md` | متغيرات البيئة والتشغيل |
| D10 | `docs/backend_test_plan.md` | سيناريوهات الاختبار |

---

## ⚠️ قواعد صارمة

1. **لا تكسر UI الحالي** — أي تغيير API خلف Adapter.
2. **كل عملية مالية atomic** — rollback كامل عند الفشل.
3. **لا `any`** — TypeScript strict فقط.
4. **العزل متعدد الشركات إلزامي** في كل query.
5. **لا نقل شامل دفعة واحدة** — التحويل تدريجي ومقاس.
6. **لا حذف لمنطق قديم** قبل وجود بديل متكامل ومختبر.
7. **نفس قرارات CorePOS الثابتة** تظل ملزمة (RTL، تنسيق الأرقام، business rules).

---

## 🔗 تعتمد على

- Agent-01: schema + database types + قواعد المعاملات
- Agent-02: auth/plan limits/middleware behavior
- Agent-03: shared UI contracts
- Agent-04/05/06: endpoints المطلوبة لمسارات POS/Finance/Reports
- Agent-00: Gate reviews قبل كل انتقال مرحلة

---

## 🧪 MVP Migration Acceptance

- [ ] onboarding يعمل بالكامل عبر backend الجديد
- [ ] POS ينشئ فاتورة ويخصم مخزون ويحدث خزينة
- [ ] sales/purchases/returns تعمل بالكامل عبر backend
- [ ] التقارير الأساسية تعمل بنفس الأرقام
- [ ] billing page يعرض الحالة الصحيحة
- [ ] super-admin flows الأساسية تعمل
- [ ] لا regression في RTL أو تجربة المستخدم
