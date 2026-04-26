## ✅ Agent-10 — Release Readiness Checklist (Pre‑Sale)

> **Owner:** Agent-10  
> **Scope:** Pilot / Pre-sale readiness  
> **Last updated:** 2026-04-24

---

## ### 0) قواعد التشغيل والتوثيق (إلزامي)

- [ ] أي نتيجة تشغيل / فشل / blocker يتسجل في `docs/agent_reports/PROGRESS.md`
- [ ] أي مخاطرة/قرار تشغيل يتسجل في `docs/agent_reports/RISKS.md`
- [ ] أي Bug/Gap يحتاج Agent آخر يتسجل في `docs/agent_reports/HANDOFFS.md`
- [ ] القرار النهائي يتسجل في `docs/release_readiness.md` (Decision + Evidence)

---

## ### 1) Baseline — تأكيد أوامر التشغيل (قبل أي تعديل)

### Backend
- [x] `npm run test:coverage --workspace @pos-sahl/backend` (PASS 2026-04-24)
- [x] `npm run contract:smoke --workspace @pos-sahl/backend` (PASS 2026-04-24)
- [x] `npm run stress:pos-sale --workspace @pos-sahl/backend` (PASS 2026-04-24)

### Root / Frontend unit
- [x] `npm run test` (PASS 2026-04-24)

### E2E (Playwright)
- [x] `npm run test:e2e` (PASS 2026-04-24) — 1 passed / 1 skipped (legacy)
- [x] توثيق طريقة تشغيل الخدمات المطلوبة لـE2E في `docs/release_readiness.md` (Backend + Frontend + DB + env)

---

## ### 2) E2E (Playwright) — رحلة كاملة (Pilot)

### Test strategy (anti-flakiness)
- [ ] اختيار Seed strategy ثابت:
  - [ ] UI-only (واقعي/أبطأ)
  - [ ] API helper (أسرع/أكثر ثباتاً)
- [ ] استخدام `storageState` أو login helper لتقليل الزمن بعد أول تسجيل

### السيناريو (حد أدنى)
- [x] register / login
- [x] onboarding/sample-data seed (backend) (PASS 2026-04-24)
- [x] create product + seed stock (via backend sample-data) (PASS 2026-04-24)
- [x] POS sale (cash) end-to-end عبر backend finance (PASS 2026-04-24)
- [x] invoice page render (page loads + invoice number visible)
- [x] reports page sanity (today totals تظهر)

### المخرجات
- [x] `tests/e2e/full_user_journey.spec.ts` موجود ويعمل
- [x] نتيجة Pass/Fail + أي flakiness notes في `docs/release_readiness.md`

---

## ### 3) Security & Tenancy Hardening (Blocker قبل البيع)

### Session enforcement
- [x] كل endpoints الحساسة تعتمد على session/cookies (enforced via middleware)
- [x] `x-company-id`:
  - [x] مسموح فقط في dev (`NODE_ENV !== production`) ومذكور كـ dev-only (tenant middleware)
  - [x] أي اعتماد عليه في production = **Blocker** (blocked by session-required + tenant middleware)
- [ ] لا endpoint يقرأ `companyId` من body/query بدل tenant context (إلا استثناء موثق في `docs/decisions.md`)

### Cross-tenant attempts (Evidence via tests)
- [x] Finance: block cross-tenant IDs (security smoke)
- [x] Inventory: block cross-tenant IDs (security smoke)
- [x] Reports: منع leakage عبر aggregation/joins (security smoke)
- [x] Contacts (إن وُجدت endpoints): block cross-tenant IDs (security smoke)

### المخرجات (اختبارات مقترحة)
- [x] `apps/backend/tests/security/security-smoke.ts` + script `npm run security:smoke --workspace @pos-sahl/backend`

---

## ### 4) Reliability under load (Stress/Soak)

### Stress — POS sale (Pilot minimum)
- [x] error rate = 0% على المسار الحرج (autocannon runner reports 0 non-2xx)
- [x] لا duplicate invoice numbers تحت concurrency (Finance db-backed concurrency test)
- [x] idempotency: نفس key + نفس payload → فاتورة واحدة (Finance db-backed idempotency test)
- [ ] p95 latency يتم تسجيلها (رقم + بيئة) (ملاحظة: autocannon يطلع p90/p97.5/p99 افتراضياً، مش p95)

### Concurrency scenarios (Commercial readiness)
- [x] نفس المنتج + نفس الخزينة تحت 50–200 concurrent requests (PASS 2026-04-24) — `STRESS_CONNECTIONS=100` / 0 non-2xx / 0 errors / p99 701ms
- [x] idempotency conflict: نفس key + payload مختلف → Conflict (PASS 2026-04-24) — `npm run idempotency:conflict --workspace @pos-sahl/backend`

### Soak (Commercial readiness)
- [x] 10–15 دقيقة stable بدون ارتفاع errors (PASS 2026-04-24) — 600s / 25 conns / 0 errors / 0 non-2xx / p99 314ms
- [ ] لا memory leak واضح (RSS تقريباً ثابت) (غير مقاس حالياً)

---

## ### 5) Observability (Minimum قبل البيع)

- [x] Request/Correlation ID موحد في logs (`x-request-id` + `rid=...`)
- [x] log policy واضح (dev vs prod) + بدون `console.log` في backend (Nest `Logger`)
- [x] health/readiness checks موثقة
- [ ] runbook مختصر في `docs/release_readiness.md`:
  - [x] كيف نحقق في فشل login
  - [x] كيف نحقق في فشل POS sale
  - [x] كيف نحقق في اختلاف التقارير

---

## ### 6) قرار الجاهزية (Final Gate)

### Pilot Ready
- [x] E2E full journey نجح مرة على الأقل (local/CI) (مع Pilot limitation: POS sale mocked)
- [x] tenancy/security tests تشمل finance+inventory+reports وناجحة (`security:smoke`)
- [x] backend tests + contract smoke خضراء
- [x] stress pos-sale ناجح (بدون non-2xx) + sequences بدون duplicates
- [x] `docs/release_readiness.md` محدث: قرار + evidence + known risks + mitigations

### Commercial Ready
- [x] soak 10–15 دقيقة stable + thresholds موثقة (PASS 2026-04-24)
- [x] concurrency + idempotency تحت ضغط موثقين (PASS 2026-04-24)
- [ ] observability/runbook جاهزين + prod env decisions موثقة

