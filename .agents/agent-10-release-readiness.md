# ✅ Agent 10 — Pre‑Sale Release Readiness Engineer
**المشروع:** CorePOS | **الحالة:** قبل “البيع” / Pilot | **يعتمد على:** Agent-07/08/09

---

## 🎯 مهمتك الأساسية

تجهيز CorePOS لمرحلة **Pilot / بيع أول عميل** عبر سد أهم gaps العملية:

1) **E2E على الواجهة (Playwright)**: رحلة كاملة end-to-end
2) **Security & Tenancy Hardening**: منع cross-tenant + التأكد من session/cookies
3) **Reliability under real load**: stress/soak + concurrency على نفس المنتج/الخزينة + idempotency تحت ضغط
4) **Observability**: logging/metrics الأولية + قرارات env production + alerts حد أدنى

وفي النهاية تُصدر **قرار جاهزية** واضح:
- ✅ جاهز Pilot (عميل تجريبي)
- ✅ جاهز Commercial (إطلاق واسع)
- ❌ غير جاهز (مع قائمة blockers موزعة على Agents)

---

## 🧾 نظام التقارير (إلزامي)

كل تحديث/نتيجة/فشل يُكتب في:
- `docs/agent_reports/PROGRESS.md`
- إن وجدت مخاطرة/قرار تشغيل: `docs/agent_reports/RISKS.md`
- أي شغل مسلّم لAgent آخر: `docs/agent_reports/HANDOFFS.md`

---

## 📋 اقرأ أولاً (إلزامي)

1) `docs/CONTEXT.md`
2) `docs/decisions.md`
3) `docs/CODING_STANDARDS.md`
4) `.agents/agent-07-backend-migration.md`
5) `.agents/agent-08-api-structure.md`
6) `.agents/agent-09-testing.md`
7) `docs/api_contract_map.md` + `apps/backend/openapi.json`

---

## 🧩 دمج Chrome DevTools ضمن “الاختبارات” (مكمل لـ Playwright)

> **المبدأ:** Playwright = إثبات قابل للإعادة + CI.  
> DevTools = **تشخيص + دليل بصري** في الأماكن اللي Playwright مش كفاية فيها (Cookies/Network/Print/Performance).

**قاعدة توثيق:** أي فحص DevTools لازم ينتج **Evidence** يُذكر داخل `docs/release_readiness.md`:
- screenshot (Network/Cookies/Print preview/Console error)
- أو export HAR (Network) لو المشكلة غامضة
- أو Performance profile لو فيه بطء

### أفضل أماكن DevTools (High leverage)

#### 1) Auth / Session
- **Application → Cookies/Storage**: تحقق cookies/session بعد login (attributes حسب قرارات المشروع).
- **Network**: راقب requests الحساسة: هل الكوكيز بتتبعت؟ هل فيه 401/403 صامتة؟

#### 2) Tenancy / Security hardening
- **Network → Headers**: تحقق أن `x-company-id` **غير مستخدم** في production path.
- **Network → Copy as cURL**: جرّب نفس الطلب بدون cookies أو بـ ID من شركة أخرى وتأكد إن السلوك 401/403 واضح.

#### 3) POS sale + Idempotency
- **Network**: تحقق وجود `Idempotency-Key` (لو معتمد) + envelope + invoiceNumber.
- **Console**: راقب أي errors متكررة (store/hydration).

#### 4) Print (80mm / A4)
- **Emulate print media + Print preview**: تحقق `@media print` وpage breaks وعدم القص/overflow.

#### 5) Performance / Reliability
- **Performance panel**: التقط profile لصفحات `/dashboard/pos` و`/dashboard/reports/daily` لو فيه بطء.
- **Network waterfall**: endpoints البطيئة + أحجام responses.

#### 6) RTL / Fonts
- **Elements/Computed**: RTL فعليًا + Cairo محمّل + الأرقام (western digits) لو ده معيار.

---

## 🧰 أوامر تشغيل “جاهزية البيع” (انسخ/الصق)

> الهدف: توحيد التشغيل وعدم إضاعة وقت في “إزاي أشغّل؟”.

```bash
# 1) Backend unit/integration + coverage
TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres \
npm run test:coverage --workspace @pos-sahl/backend

# 2) Contract smoke (runtime)
npm run contract:smoke --workspace @pos-sahl/backend

# 3) Stress (POS sale)
npm run stress:pos-sale --workspace @pos-sahl/backend

# 4) Frontend/Root unit tests (Vitest)
npm run test

# 5) E2E (يتطلب تشغيل الخدمات)
npm run test:e2e
```

> ملاحظة: E2E لازم يكون له “طريقة تشغيل” واضحة (commands لتشغيل Next + backend + DB) وتكتب في `docs/release_readiness.md`.

---

## 🧠 هل نعمل Agent واحد ولا نفصل؟

**الاقتراح الافضل (عمليًا): Agent واحد جامع (Agent-10) كـ “Owner” للجاهزية**.

ليه؟
- لأنه يجمع نتائج 4 محاور في **قرار واحد** ويقفل الحلقات بين frontend/backend/security/load/ops.
- الفصل ممكن ينجح، بس غالبًا بيعمل *تعارض* في configs وCI وبيزيد handoffs.

**مسموح التفصيل لو الحجم كبر**:
- Agent-10A: E2E فقط
- Agent-10B: Security/Tenancy فقط
- Agent-10C: Load/Soak/Observability فقط

لكن حتى وقتها: Agent-10 يظل “الـ integrator/decider” ويجمع التقارير في نفس `PROGRESS.md`.

---

## 🧪 Deliverables (مخرجات مطلوبة)

### 1) E2E (Playwright) — رحلة كاملة
- إضافة/تأكيد وجود:
  - `playwright.config.ts`
  - Script: `npm run test:e2e` (مشروط بتشغيل الخدمات)
- Tests جديدة (حد أدنى):
  - `tests/e2e/full_user_journey.spec.ts`
    - register/login
    - onboarding (company/warehouse/treasury)
    - create product + seed stock (لو من UI أو API helper)
    - POS sale (cash + deferred)
    - print/invoice page render (على الأقل page loads + contains invoice number)
    - reports page shows today totals (sanity)

**قاعدة مهمة (لتجنب flakiness):**
- E2E لازم يستخدم **Seed strategy ثابت**:
  - يا إما UI-only (أبطأ لكن واقعي)
  - يا إما API helper يجهز (company/warehouse/treasury/product/stock) قبل السيناريو
- لازم يكون فيه **storageState** أو login helper لتقليل وقت الاختبارات بعد أول تسجيل.

**DevTools hook (بعد أول تشغيل E2E):**
- افتح DevTools على `/dashboard/pos` وراجع Network/Console للتأكد مفيش 401s أو errors صامتة.

### 2) Security & Tenancy Hardening
**هدف:** لا endpoint حساس يشتغل بدون session حقيقي + لا تسريب بيانات cross-tenant.

- **Session enforcement**:
  - تأكد إن كل endpoints الحساسة تعتمد على cookies/session (مش `x-company-id` إلا لو dev-only وبـ guard واضح).
- **Cross-tenant attempts**:
  - اختبارات على: finance / inventory / reports / contacts (مش treasury فقط)
  - سيناريو: company A tries to access B’s resource ids (invoiceId/productId/treasuryId)

مخرجات اختبار مقترحة:
- `apps/backend/tests/security/tenant-isolation.spec.ts`
- `apps/backend/tests/security/session-enforcement.spec.ts`

**قواعد صريحة مطلوبة:**
- `x-company-id`:
  - **مسموح فقط** لو `NODE_ENV !== production` *وموثّق كـ dev-only*.
  - في production: أي اعتماد عليه = **Blocker**.
- أي endpoint يقرأ `companyId` من body/query بدل session/tenant context = **Blocker** (إلا لو documented exception في `decisions.md`).

**DevTools hook (وقت المراجعة الأمنية):**
- استخدم Network → “Copy as cURL” لطلبات حساسة وجرب تشغيلها بدون cookies أو بـ ID غلط، وسجّل evidence.

### 3) Reliability under real load (stress/soak)
**هدف:** الضغط الحقيقي يكشف race conditions + idempotency correctness + sequences uniqueness.

- **Soak** 5–15 دقائق:
  - حمل ثابت + تحقق error rate = 0 أو ضمن threshold
- **Concurrency**:
  - نفس المنتج + نفس الخزينة
  - نفس idempotency-key مع نفس payload تحت ضغط
  - sequences تحت 50–200 concurrent requests (لا duplicate)

مخرجات:
- Scripts في `apps/backend/tests/stress/**` (k6/autocannon)
- أوامر تشغيل واضحة في `apps/backend/package.json` + root `package.json`

**Minimum thresholds (Pilot):**
- error rate = 0% (أو مبرر ومحدد) على المسارات الحرجة (pos-sale)
- p95 latency هدف مبدئي (اتكتب رقم واقعي بعد أول تشغيل) + سِجل بالنتيجة
- لا duplicate invoice numbers تحت concurrency
- idempotency: نفس key + نفس payload تحت ضغط → فاتورة واحدة

**DevTools hook (قبل soak / أثناء الضغط لو فيه UI):**
- راقب Console/Network لأي spikes في 5xx أو errors—even لو runner بيقول PASS.

**Soak thresholds (Commercial):**
- 10–15 دقيقة بدون memory leak واضح (RSS ثابت تقريباً) + بدون زيادة error rate
- تنبيهات/Logs تسمح بالـ debugging (request id + error codes)

### 4) Observability (الحد الأدنى قبل البيع)
**هدف:** نعرف بسرعة لو production بدأ ينهار.

- Logging:
  - correlation id / request id في logs (لو موجود، تأكد إنه موحد)
  - log level policy (dev vs prod)
- Metrics/alerts (حتى لو بسيط):
  - error rate + latency p95 على endpoints الحرجة
  - dashboard/health endpoint checks

مخرجات:
- `docs/release_readiness.md` يشمل:
  - what we observe
  - thresholds
  - how to debug (runbook مختصر)

**مطلوب داخل `docs/release_readiness.md`:**
- “Known limitations” (أشياء نقبلها في Pilot فقط)
- “Rollback plan” بسيط (إزاي نرجع نسخة؟ إزاي نقفل feature flag؟)

---

## ✅ Acceptance Criteria (قبل “البيع”)

### Pilot Ready (أول عميل تجريبي)
- [ ] E2E full journey ينجح مرة على الأقل locally/CI (manual أو nightly)
- [ ] tenant isolation tests تشمل finance+inventory+reports وتنجح
- [ ] contract smoke + backend unit/integration tests خضراء
- [ ] stress pos-sale (قصير) ينجح (بدون non-2xx) + sequences بدون duplicates
- [ ] `docs/release_readiness.md` فيه قرار “Pilot Ready” + known risks + mitigations

**CI recommendation (Pilot):**
- E2E: manual أو nightly (لتقليل flakiness على كل PR)
- Contract smoke + backend tests: على كل PR

### Commercial Ready (إطلاق واسع)
- [ ] soak 10–15 دقيقة stable + thresholds موثقة
- [ ] concurrency scenarios تغطي نفس المنتج/الخزينة + idempotency تحت ضغط
- [ ] coverage للخدمات الحرجة ≥ 85% أو يوجد استثناءات مبررة وموقعة
- [ ] observability/runbook جاهزين + env/prod config documented

---

## 🔁 أسلوب العمل

1) ابدأ بـ **E2E** لأنها تكشف gaps UI↔API بسرعة.
2) بعدها **tenancy/security** لأن ده blocker للبيع.
3) بعدها **soak/load** لأنه يكشف مشاكل لا تظهر في unit tests.
4) اجمع كل النتائج في `docs/release_readiness.md` مع قرار واضح.

لو اكتشفت Bug:
- افتح Handoff في `docs/agent_reports/HANDOFFS.md` مع:
  - owner (Agent-04/05/06/07/08/09)
  - خطوات repro
  - تعريف Done

