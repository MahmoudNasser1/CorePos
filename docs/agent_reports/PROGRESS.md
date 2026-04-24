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

### 2026-04-24 16:54 (Local)
- **Agent**: Agent-09
- **Area**: Infra / Backend DB Testing + Auth
- **Status**: in_progress

- **✅ Done**
  - Implemented DB-backed test bootstrap that provisions a dedicated Postgres test database from Drizzle migration (`apps/backend/drizzle/0000_*.sql`) + supplemental tables for SaaS/idempotency.
  - Added DB helpers: `apps/backend/tests/helpers/test-db.ts`, `pg-client.ts`, `reset-db.ts` (truncate isolation).
  - Added DB-backed Auth tests: `apps/backend/tests/auth.service.spec.ts` (register/login/token expiry).
  - Adjusted finance invariant test to avoid relying on Drizzle internal SQL shape.
- **❌ Failed / Issues**
  - Docker compose in this environment required access to Docker daemon; existing postgres container `backend-postgres-1` was already running on `5433`.
- **➡️ Next**
  - Action: Add factories + begin Inventory/Onboarding DB-backed tests (then Finance POS sale/idempotency/sequence).
  - Owner: Agent-09
- **🧪 Commands**
  - `docker ps -a --filter name=backend-postgres-1`
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (to be captured after adding more service tests)

### 2026-04-24 16:56 (Local)
- **Agent**: Agent-09
- **Area**: Onboarding / Helpers
- **Status**: done

- **✅ Done**
  - Added backend test factories: `apps/backend/tests/helpers/factories.ts`.
  - Added db-backed Onboarding tests: `apps/backend/tests/onboarding.service.spec.ts` (createInitialCompany + setupSampleData).
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Add Inventory db-backed tests (list/search/create/updateStock/low-stock + tenant isolation).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 16:59 (Local)
- **Agent**: Agent-09
- **Area**: Inventory
- **Status**: done

- **✅ Done**
  - Fixed `InventoryService.getLowStockAlerts()` to reliably filter low-stock results (numeric-safe post-filter).
  - Added db-backed Inventory tests: `apps/backend/tests/inventory.service.spec.ts`:
    - tenant isolation for `listProducts`
    - search by name/barcode/sku
    - `createProduct` initializes stock when `warehouseId` provided
    - `updateStock` weighted average cost + sync product `avg_cost`
    - `getLowStockAlerts` returns only low-stock items
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Start Finance db-backed tests (POS sale: atomicity, insufficient stock, deferred vs cash, idempotency, invoice sequencing under concurrency).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:01 (Local)
- **Agent**: Agent-09
- **Area**: Finance
- **Status**: in_progress

- **✅ Done**
  - Added `createCustomer` factory to `apps/backend/tests/helpers/factories.ts`.
  - Added db-backed Finance tests: `apps/backend/tests/finance.service.spec.ts`:
    - cash POS sale: invoice + items + stock decrement + treasury tx + treasury balance increment + invoice number format `YYMM-NNN`
    - deferred POS sale: no treasury tx, customer balance increases, invoice becomes partial
    - insufficient stock throws `BadRequestException`
    - idempotency returns same invoice and avoids duplicate rows
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Extend Finance tests for atomicity rollback + invoice sequence under concurrency + idempotency hash mismatch conflict.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:05 (Local)
- **Agent**: Agent-09
- **Area**: Auth + Finance
- **Status**: done

- **✅ Done**
  - Extended Finance db-backed tests with:
    - atomic rollback verification
    - idempotency conflict (same key, different payload → `ConflictException`)
    - invoice sequence uniqueness under concurrency
  - Extended Auth db-backed tests with:
    - refresh token flow
    - session payload shape
    - production guardrail: fail when `JWT_SECRET` is unset
  - Added production guardrail in `apps/backend/src/modules/auth/auth.service.ts` (`JWT_SECRET` must be set when `NODE_ENV=production`).
- **❌ Failed / Issues**
  - None (backend suite green).
- **➡️ Next**
  - Action: Add Reports db-backed tests (daily summary + treasury + stock) with tenant isolation leak checks.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:06 (Local)
- **Agent**: Agent-09
- **Area**: Reports
- **Status**: done

- **✅ Done**
  - Fixed data isolation bug in `ReportsService.getTreasuryReport()` (now filters by `company_id`).
  - Added db-backed Reports tests: `apps/backend/tests/reports.service.spec.ts`:
    - daily summary returns zeros with no invoices
    - stock report aggregates qty/value across warehouses
    - treasury report is tenant-isolated (no cross-company leakage)
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Contract smoke tests need to run against compiled NestJS runtime (decorator metadata). We'll implement as a node script that builds/runs backend and asserts endpoints/envelope (instead of Vitest in-process).
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:12 (Local)
- **Agent**: Agent-09
- **Area**: Integration
- **Status**: done

- **✅ Done**
  - Added integration flow tests: `apps/backend/tests/integration.flow.spec.ts`:
    - onboarding→product+stock→POS cash sale→reports reflect sales/profit/stock/treasury updates
    - multi-tenant treasury isolation (company A cannot see company B)
- **❌ Failed / Issues**
  - None.
- **➡️ Next**
  - Action: Implement contract smoke checks as a runtime script (build+start backend then supertest/fetch asserts) to avoid decorator-metadata issues in in-process tests.
  - Owner: Agent-09
- **🧪 Commands**
  - `TEST_DATABASE_BASE_URL=postgres://pos:pos@localhost:5433/postgres npm run test --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:15 (Local)
- **Agent**: Agent-09
- **Area**: Contract
- **Status**: done

- **✅ Done**
  - Added runtime contract smoke script (build+run backend then HTTP assertions): `apps/backend/tests/contract/contract-smoke.ts`.
  - Added workspace script: `npm run contract:smoke --workspace @pos-sahl/backend`.
  - Verified contract smoke for: auth register/session/refresh, onboarding company, finance pos-sale (with seeded defaults).
- **❌ Failed / Issues**
  - In-process supertest contract suite was removed due to decorator-metadata limitations under Vitest/esbuild; runtime script is the reliable path.
- **➡️ Next**
  - Action: Add stress/load runner (autocannon) and scripts to hit `/v1/finance/pos-sale` concurrently + verify idempotency/sequences.
  - Owner: Agent-09
- **🧪 Commands**
  - `npm run contract:smoke --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Lines: (capture later in coverage report milestone)

### 2026-04-24 17:20 (Local)
- **Agent**: Agent-09
- **Area**: Stress / CI / Coverage
- **Status**: done

- **✅ Done**
  - Added backend stress runner: `npm run stress:pos-sale --workspace @pos-sahl/backend` (autocannon, seeds data, runs load, asserts 0 errors/non-2xx).
  - Added root stress script: `npm run test:stress` (manual autocannon runner; requires env vars).
  - Added `docs/test_coverage_report.md` and captured backend coverage snapshot via `npm run test:coverage --workspace @pos-sahl/backend`.
  - Added CI workflow `.github/workflows/ci.yml` (lint + backend tests + backend coverage + contract smoke) with Postgres service.
- **❌ Failed / Issues**
  - Known: npm audit reports vulnerabilities (not addressed in this testing pass).
- **➡️ Next**
  - Action: Raise coverage toward acceptance thresholds by adding more Finance/Auth branch coverage + controller tests (optional).
  - Owner: Agent-09 / Orchestrator decision
- **🧪 Commands**
  - `npm run test:coverage --workspace @pos-sahl/backend`
  - `npm run contract:smoke --workspace @pos-sahl/backend`
  - `npm run stress:pos-sale --workspace @pos-sahl/backend`
- **📊 Coverage**
  - Backend all-files lines: 58.99% (snapshot recorded in `docs/test_coverage_report.md`)

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

