# 📌 CorePOS — Agent Progress (Single Source of Truth)

> **الهدف:** ملف واحد نتابع منه “مين عمل إيه” و“إيه اللي اتعطل وليه” عبر كل الـ Agents.
>
> **قاعدة إلزامية:** أي Agent ينجز شغل (tests/bugs/contracts/infra) لازم يضيف تحديث هنا.

---

## 🧾 Update Template (انسخ/الصق)

### YYYY-MM-DD HH:MM (Local)
- **Agent**: Agent-XX
- **Area**: (Auth / Onboarding / Inventory / Finance / Reports / Infra / Contract / Stress / E2E)
- **Status**: (in_progress / blocked / done)

- **✅ Done**
  - ...
- **❌ Failed / Issues**
  - Issue: ...
  - Suspected cause: ...
  - Evidence (short): ...
- **➡️ Next**
  - Action: ...
  - Owner: Agent-XX
- **🧪 Commands**
  - `...`
- **📊 Coverage**
  - Lines: ...
  - Functions: ...
  - Branches: ...

---

## 📦 Current Hand-offs

> لما Agent-09 يسلّم Bug/Gap لAgent تاني، يتسجل هنا لحد ما يتقفل.

- **[OPEN]** ...

---

## 🗓️ Updates Log

<!-- Updates go below. Keep newest on top. -->

### 2026-04-24 16:36 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Backend Testing
- **Status**: done

- **✅ Done**
  - Added backend workspace test scripts in `apps/backend/package.json`: `test`, `test:watch`, `test:coverage`.
  - Added backend Vitest config `apps/backend/vitest.config.ts`.
  - Added Nest test helper `apps/backend/tests/helpers/nest-app.ts` (mirrors runtime global prefix/pipes/filters/interceptors).
  - Added backend smoke tests for health/readiness: `apps/backend/tests/health.spec.ts`.
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Add Postgres test strategy + migrations runner (BEGIN/ROLLBACK) to unlock service tests (Auth/Inventory/Finance).
  - Owner: Agent-09
- **🧪 Commands**
  - `npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: N/A (smoke tests only; service tests next).

### 2026-04-24 16:24 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Testing
- **Status**: done

- **✅ Done**
  - Added Vitest runner + coverage + scripts in root `package.json` (`test`, `test:watch`, `test:coverage`, `test:e2e`).
  - Added `vitest.config.ts` with tsconfig-paths and coverage config.
  - Added `tsconfig.test.json` for Vitest/Playwright typing and test includes.
  - Added `playwright.config.ts` and aligned E2E baseURL to `http://localhost:4001`.
  - Migrated legacy Jest unit tests to Vitest: `tests/unit/frontend/*.spec.ts`.
  - Mocked Next.js-only APIs in unit tests (`next/cache` revalidatePath) + enabled backend flags per test to avoid Next request-scope issues.
- **❌ Failed / Issues**
  - None (unit suite is green).
- **➡️ Next**
  - Action: Add shared test helpers (`tests/helpers/**`) and Postgres-backed backend test strategy (migrations + BEGIN/ROLLBACK).
  - Owner: Agent-09
- **🧪 Commands**
  - `npm install`
  - `npm run test`
- **📊 Coverage**
  - Lines: 3.99% (expected low until backend/service tests land)
  - Commands: `npm run test:coverage`

- **Notes**
  - Backend smoke tests landed in `apps/backend/tests/*` and run via workspace scripts.

