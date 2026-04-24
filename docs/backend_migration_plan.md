# Backend Migration Plan

## Overview
- Status: in progress with end-to-end baseline completed.
- Objective: migrate runtime paths to NestJS backend without UX regressions.
- Strategy: adapter-first rollout with per-domain feature flags.

## Phase Status

### Phase 1 — Backend Foundation
- Completed:
  - Added backend workspace at `apps/backend`.
  - Added strict TypeScript backend baseline.
  - Added health/readiness endpoints.
  - Added docker-compose for postgres/redis/minio.
  - Added unified error filter and request logging interceptor.

### Phase 2 — Auth + Tenant Context
- Completed baseline:
  - Added JWT login/refresh/logout/reset endpoints.
  - Added session endpoint returning user/profile/company/subscription shape.
  - Added `AsyncLocalStorage` tenant context + middleware hook.
- Pending hardening:
  - Replace mock session with real user store and hashed credentials.
  - Add production guards and role checks tied to persistence.

### Phase 3 — Master Data APIs
- Completed baseline:
  - Onboarding company creation endpoint.
  - Onboarding sample-data endpoint.
  - Frontend adapter integration for onboarding flow behind feature flag.
- Pending:
  - Full branches/warehouses/products/customers/suppliers/categories CRUD.
  - MinIO upload and signed URLs.
  - plan-limits enforcement by persisted metrics.

### Phase 4 — Financial Transaction Engine
- Completed baseline:
  - Finance endpoints for sale/purchase/returns/payments with API contracts.
  - `YYMM-NNN` numbering shape returned for invoices (placeholder).
- Completed enhancement:
  - Added Drizzle `db.transaction()` flow for POS sale path in `/finance/pos-sale`.
  - Transaction updates invoice header/items, stock movement, and treasury balance in one atomic unit.
  - Added deterministic sequence allocation via `invoice_sequences` with `ON CONFLICT ... DO UPDATE` for concurrent-safe numbering.
  - Added backend transaction endpoints for adapter migration:
    - `/finance/sale-invoice`
    - `/finance/payment-receipt`
- Pending:
  - Drizzle transactional writes for stock/treasury/ledger parity.
  - extend deterministic sequence to all financial document types.

### Phase 5 — Reports + Billing + Super Admin
- Completed baseline:
  - Reports endpoints: daily/sales/profits/stock/treasury.
  - Super-admin endpoints: companies/audit-logs.
- Pending:
  - Financially accurate report queries over production schema.
  - billing workflow persistence and full audit trails.

### Phase 6 — Frontend Adapter Migration
- Completed baseline:
  - Created `src/lib/api` adapter foundation.
  - Added backend fetch client and feature flag controls.
- Migrated onboarding actions to adapters (no legacy fallback).
- Completed enhancement:
  - Migrated `createPOSInvoice` to backend adapter behind finance flag.
  - Migrated `createSaleInvoice` and `createPayment` to backend adapters behind finance flag.
- Pending:
  - Migrate remaining action domains incrementally using same pattern.

### Phase 7 — Cutover
- Completed baseline:
  - Migration checklist and verification commands documented.
- Pending:
  - enable flags domain-by-domain after parity testing in staging.
  - remove any legacy direct data access from migrated paths.

## Next Execution Order
1. Persist auth and tenant models in database + guards.
2. Implement Drizzle schema and transaction services for invoices.
3. Migrate `inventory.actions.ts`, `invoices.ts`, `payments.ts`, `reports.actions.ts` to adapters.
4. Run side-by-side parity tests between old and new paths.
