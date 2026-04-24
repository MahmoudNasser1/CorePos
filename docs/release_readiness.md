# ✅ CorePOS — Release Readiness (Pre‑Sale)
> **الهدف:** وثيقة واحدة تحدد هل النظام جاهز **Pilot** أو **Commercial** أو **Not Ready**، ولماذا.

---

## ### 1) القرار النهائي

- **Decision**: ✅ Pilot Ready / ⬜ Commercial Ready / ⬜ Not Ready
- **Date**: 2026-04-24
- **Owner**: Agent-10 (مع مراجعة Agent-00 Orchestrator)

---

## ### 2) Executive Summary (3–7 نقاط)

- ✅ جاهزية Pilot من ناحية backend correctness: tests + contract smoke + security smoke + stress PASS.
- ✅ Tenancy & session enforcement: محكوم عبر middleware + runtime smoke يمنع header-only tenant في production.
- ✅ Reliability: idempotency + invoice sequencing تحت concurrency مغطاة باختبارات Finance db-backed + stress error-rate صفر.
- ✅ Observability حد أدنى: `x-request-id` + `rid=...` في logs + `requestId` ضمن تفاصيل الخطأ.
- ✅ E2E POS sale أصبح end-to-end حقيقي عبر backend-seeded inventory + backend finance (بدون mock).
- ✅ Fixed: Nest route warning `"/v1/*"` اتقفل (wildcard route صار `*path`).

---

## ### 3) What was tested (Evidence)

### **E2E (Playwright)**
- **Test file**: `tests/e2e/full_user_journey.spec.ts`
- **Run command**: `npm run test:e2e`
- **Result**: ✅ Pass (local)
- **Notes (flakiness / retries / storageState)**:
  - E2E يعتمد على تشغيل الخدمات عبر `playwright.config.ts` (`webServer`).
  - E2E الآن يعمل real POS sale: يزرع sample-data في backend ثم يختار منتج من `/v1/inventory/products` ويعمل `/v1/finance/pos-sale` فعليًا.

### **DevTools evidence (manual verification)**
> DevTools هنا ليس بديل للاختبارات—هو دليل بصري/تشخيص للمشاكل الصعبة (cookies/headers/print/perf).

- **Session cookies verified** (Application → Cookies):
  - Evidence: (screenshot / notes)
- **Tenancy/security verified** (Network → headers + Copy as cURL):
  - Evidence: (HAR/screenshot)
- **Print verified** (Emulate print media + Print preview):
  - Evidence: (screenshot)
- **Performance sanity** (Performance profile / Network waterfall):
  - Evidence: (profile note)

### **Backend tests + Contract smoke**
- **Unit/Integration**: `npm run test:coverage --workspace @pos-sahl/backend`
- **Contract smoke**: `npm run contract:smoke --workspace @pos-sahl/backend`
- **Security smoke**: `npm run security:smoke --workspace @pos-sahl/backend`
- **Result**:
  - ✅ Backend coverage suite: 8 files / 32 tests — PASS
  - ✅ Contract smoke (runtime): PASS (`[contract-smoke] OK`)
  - ✅ Security smoke (runtime): PASS (`[security-smoke] OK`)
  - Coverage (All files): Statements 58.99% | Branches 58.7% | Functions 32.88% | Lines 58.99%

### **Stress/Load**
- **Stress command**: `npm run stress:pos-sale --workspace @pos-sahl/backend`
- **Soak**: `SOAK_DURATION_SEC=600 npm run soak:pos-sale --workspace @pos-sahl/backend`
- **Concurrency (100 conns)**: `STRESS_CONNECTIONS=100 STRESS_DURATION_SEC=10 npm run stress:pos-sale --workspace @pos-sahl/backend`
- **Idempotency conflict**: `npm run idempotency:conflict --workspace @pos-sahl/backend`
- **Result**:
  - ✅ Stress run: 1k requests / ~11s — PASS (0 non-2xx reported by runner)
  - Latency stats (from runner):
    - p50: 138ms
    - p90: (capturable from runner output; autocannon لا يعرض p95 افتراضياً)
    - p97.5: 553ms
    - p99: 689ms
    - max: 1210ms
  - Throughput stats:
    - avg: 132.82 req/s
  - ✅ Soak run (10 min): **136k requests / 600s** — PASS
    - errors: 0
    - non-2xx: 0
    - latency: p90 175ms / p97.5 253ms / p99 314ms / max 1123ms
  - ✅ Concurrency run (100 conns): PASS
    - errors: 0
    - non-2xx: 0
    - latency: p90 547ms / p97.5 633ms / p99 701ms / max 836ms
  - ✅ Idempotency conflict: PASS (same `idempotency-key` + different payload → 409 Conflict)

---

## ### 4) Tenancy & Security checklist

- **Session enforcement**:
  - [x] No sensitive endpoint relies on `x-company-id` in production
  - [x] Auth/session cookie is required for sensitive endpoints
- **Cross-tenant attempts**:
  - [x] finance endpoints block cross-tenant IDs
  - [x] inventory endpoints block cross-tenant IDs
  - [x] reports endpoints block cross-tenant leakage
  - [x] contacts endpoints block cross-tenant leakage (إن وُجد)

**Evidence links (tests/files):**
- `apps/backend/src/common/middleware/session-required.middleware.ts`
- `apps/backend/src/common/tenant/tenant.middleware.ts`
- `apps/backend/tests/security/security-smoke.ts`

---

## ### 5) Reliability checklist (under load)

- [x] No duplicate invoice numbers under concurrency
- [x] Idempotency correctness under load (same key + same payload → one result)
- [x] Error rate acceptable (Pilot target: 0% على المسارات الحرجة أو مبرر)
- [ ] p95 latency captured (autocannon لا يخرج p95 افتراضياً؛ بديل: p90 + p97.5 أو تغيير الأداة)

**Evidence (logs/outputs):**
- Backend tests:
  - `apps/backend/tests/finance.service.spec.ts` (idempotency + invoice sequence under concurrency)
- Stress:
  - `npm run stress:pos-sale --workspace @pos-sahl/backend` (0 non-2xx reported; p50/p97.5/p99 captured above)

---

## ### 6) Observability & Runbook (minimum)

### **What we log**
- request/correlation id: `x-request-id` (يمر عبر الـresponse + يظهر في logs كـ `rid=...`)
- error codes: يرجع في الـAPI envelope `error.code` (مثال: `SESSION_MISSING`, `TENANT_MISSING`, `INVARIANT_VIOLATION`)

### **How to debug production issues quickly**
- **If login fails**:
  - راجع `/v1/auth/login` (status + envelope) + تأكد cookies اتثبتت: `access_token`, `refresh_token`
  - راجع `/v1/auth/session` بنفس cookies
  - استخدم `x-request-id` من الـresponse ودوّر عليه في logs
- **If POS sale fails**:
  - راجع error `code/message/details` (شائع: `INVARIANT_VIOLATION` مثل “لا توجد خزينة…”, “الإجمالي لا يطابق…”)
  - تأكد `idempotency-key` (لو موجود) لتتبع تكرار الطلبات
  - دوّر على `rid=...` في logs لمشاهدة زمن الطلب والـexception
- **If reports show wrong totals**:
  - تأكد إن tenant context صحيح (company_id من session) ثم جرّب endpoints: `/v1/reports/daily`, `/v1/reports/stock`, `/v1/reports/treasury`
  - راجع `rid=...` لو في query errors
  - استخدم Security smoke كمرجع لعدم وجود leakage cross-tenant

### **Health checks**
- backend: `/v1/health` + `/v1/readiness`
- frontend: `/login` page load + `/dashboard` after login

---

## ### 7) Known limitations (Pilot-only)

> أي شيء هنا لازم يكون “مقبول” للـ Pilot فقط، وممنوع للـ Commercial.

- coverage: نسبة التغطية الحالية أقل من هدف Commercial (تُرفع تدريجيًا قبل الإطلاق الواسع).

---

## ### 8) Risks + Mitigations

- **Risk**: Nest warning `"/v1/*"` auto-conversion
  - **Impact**: احتمال misrouting في production لو كان فيه wildcard route فعلي
  - **Mitigation**: ✅ Fixed في `apps/backend/src/app.module.ts` (استخدام `*path` بدل `*`)
  - **Owner**: Agent-10

---

## ### 9) Rollback plan (مختصر وواضح)

- **Rollback triggers**:
  - spike في 5xx على endpoints الحرجة (auth/pos-sale)
  - latency p95 يزيد بشكل ملحوظ مقارنة بالـbaseline
  - أي مؤشر cross-tenant leakage
- **Rollback steps**:
  1) إيقاف/تعطيل أي feature flags للـbackend-migration في الواجهة (لو مفعل)
  2) الرجوع لآخر نسخة مستقرة من الواجهة/الخادم (deploy rollback)
  3) التحقق من استعادة health: `/v1/health` + `/v1/readiness`
- **Feature flags** (إن وجدت):
  - `BACKEND_FLAG_*` (تبديل مسارات الواجهة أثناء الهجرة/التجارب)

